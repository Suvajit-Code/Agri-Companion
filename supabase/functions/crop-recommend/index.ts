export {};

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

type FarmData = {
  location?: string;
  soilType?: string;
  farmSize?: number;
  sizeUnit?: string;
  budget?: number;
  waterAvailability?: string;
  irrigationType?: string;
  season?: string;
  purpose?: string;
};

type CropRecommendation = {
  crop_name: string;
  suitability_reason: string;
  estimated_cost: number;
  expected_roi: number;
  growth_duration: string;
  water_requirement: "low" | "medium" | "high";
  difficulty_level: "easy" | "medium" | "hard";
};

const CACHE_TTL_HOURS = Number(Deno.env.get("CROP_RECOMMEND_CACHE_TTL_HOURS") || "24");
const CACHE_KEY_VERSION = "v2";

type CropProfile = {
  estimated_cost: number;
  expected_roi: number;
  growth_duration: string;
  water_requirement: "low" | "medium" | "high";
  difficulty_level: "easy" | "medium" | "hard";
};

const CROP_ALIASES: Record<string, string> = {
  paddy: "rice",
  "basmati rice": "rice",
  "aromatic rice": "rice",
  pulse: "chickpea",
  "green gram": "moong",
  "black gram": "urad",
  oats: "barley",
  lucerne: "alfalfa",
  groundnut: "peanut",
  cashew: "cashewnut",
};

const normalizeCommonCropName = (cropName: string): string => {
  const lower = cropName.toLowerCase().trim();
  return CROP_ALIASES[lower] || lower;
};

const cleanText = (value: unknown, fallback = "") => {
  if (typeof value !== "string") return fallback;
  return value.trim();
};

const cleanNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizeWaterRequirement = (value: unknown): "low" | "medium" | "high" => {
  const v = cleanText(value, "medium").toLowerCase();
  if (v.includes("low")) return "low";
  if (v.includes("high")) return "high";
  return "medium";
};

const normalizeDifficulty = (value: unknown): "easy" | "medium" | "hard" => {
  const v = cleanText(value, "medium").toLowerCase();
  if (v.includes("easy")) return "easy";
  if (v.includes("hard")) return "hard";
  return "medium";
};

const normalizeCrop = (item: Record<string, unknown>): CropRecommendation => {
  const durationRaw = cleanText(item.growth_duration, "120 days");
  const duration = durationRaw.toLowerCase().includes("day")
    ? durationRaw
    : `${Math.max(60, Math.round(cleanNumber(durationRaw, 120)))} days`;

  return {
    crop_name: cleanText(item.crop_name, "Recommended Crop"),
    suitability_reason: cleanText(item.suitability_reason, "Suitable for the provided farm conditions."),
    estimated_cost: Math.max(1000, Math.round(cleanNumber(item.estimated_cost, 15000))),
    expected_roi: Math.max(10, Math.round(cleanNumber(item.expected_roi, 60))),
    growth_duration: duration,
    water_requirement: normalizeWaterRequirement(item.water_requirement),
    difficulty_level: normalizeDifficulty(item.difficulty_level),
  };
};

const buildCacheKey = (farmData: FarmData) => {
  const location = cleanText(farmData.location, "auto")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9,\s-]/g, "");
  const soilType = cleanText(farmData.soilType, "unknown").toLowerCase();
  const budget = Math.max(0, Math.round(cleanNumber(farmData.budget, 0)));
  return `${CACHE_KEY_VERSION}|${location}|${soilType}|${budget}`;
};

const getCacheConfig = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;
  return { supabaseUrl, serviceRoleKey };
};

const isRateLimitError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("rate limit") || message.includes("quota") || message.includes("too many requests");
};

const isRecoverableAiError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    isRateLimitError(error) ||
    message.includes("temporarily unavailable") ||
    message.includes("timeout") ||
    message.includes("invalid response")
  );
};

const getCachedRecommendations = async (
  cacheKey: string,
  options: { includeExpired?: boolean } = {}
): Promise<CropRecommendation[] | null> => {
  const cfg = getCacheConfig();
  if (!cfg) return null;

  const params = new URLSearchParams();
  params.set("select", "response_data,expires_at");
  params.set("cache_key", `eq.${cacheKey}`);
  if (!options.includeExpired) {
    params.set("expires_at", `gt.${new Date().toISOString()}`);
  }
  params.set("order", "created_at.desc");
  params.set("limit", "1");

  const response = await fetch(`${cfg.supabaseUrl}/rest/v1/crop_recommendation_cache?${params.toString()}`, {
    method: "GET",
    headers: {
      apikey: cfg.serviceRoleKey,
      Authorization: `Bearer ${cfg.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.warn("Cache read skipped:", response.status);
    return null;
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const crops = rows[0]?.response_data?.crops;
  if (!Array.isArray(crops) || crops.length === 0) return null;
  return crops as CropRecommendation[];
};

const CROP_PROFILES: Record<string, CropProfile> = {
  rice: { estimated_cost: 36000, expected_roi: 62, growth_duration: "120 days", water_requirement: "high", difficulty_level: "medium" },
  wheat: { estimated_cost: 24000, expected_roi: 55, growth_duration: "115 days", water_requirement: "medium", difficulty_level: "easy" },
  maize: { estimated_cost: 22000, expected_roi: 58, growth_duration: "105 days", water_requirement: "medium", difficulty_level: "easy" },
  millet: { estimated_cost: 16000, expected_roi: 48, growth_duration: "95 days", water_requirement: "low", difficulty_level: "easy" },
  sorghum: { estimated_cost: 18000, expected_roi: 50, growth_duration: "100 days", water_requirement: "low", difficulty_level: "easy" },
  cotton: { estimated_cost: 42000, expected_roi: 68, growth_duration: "165 days", water_requirement: "medium", difficulty_level: "hard" },
  sugarcane: { estimated_cost: 56000, expected_roi: 72, growth_duration: "300 days", water_requirement: "high", difficulty_level: "hard" },
  groundnut: { estimated_cost: 21000, expected_roi: 54, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
  soybean: { estimated_cost: 20000, expected_roi: 52, growth_duration: "95 days", water_requirement: "medium", difficulty_level: "easy" },
  chickpea: { estimated_cost: 17000, expected_roi: 50, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
  lentil: { estimated_cost: 17500, expected_roi: 51, growth_duration: "105 days", water_requirement: "low", difficulty_level: "easy" },
  mustard: { estimated_cost: 18500, expected_roi: 53, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
  tomato: { estimated_cost: 32000, expected_roi: 66, growth_duration: "90 days", water_requirement: "medium", difficulty_level: "medium" },
  onion: { estimated_cost: 29000, expected_roi: 64, growth_duration: "120 days", water_requirement: "medium", difficulty_level: "medium" },
  potato: { estimated_cost: 30000, expected_roi: 63, growth_duration: "100 days", water_requirement: "medium", difficulty_level: "medium" },
  sunflower: { estimated_cost: 21000, expected_roi: 49, growth_duration: "105 days", water_requirement: "low", difficulty_level: "easy" },
  barley: { estimated_cost: 19000, expected_roi: 47, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
  pigeonpea: { estimated_cost: 20000, expected_roi: 52, growth_duration: "170 days", water_requirement: "low", difficulty_level: "easy" },
};

const SOIL_PRIORITY: Record<string, string[]> = {
  alluvial: ["rice", "wheat", "sugarcane", "maize", "mustard"],
  black: ["cotton", "soybean", "sorghum", "groundnut", "pigeonpea"],
  red: ["groundnut", "millet", "maize", "pigeonpea", "sunflower"],
  laterite: ["millet", "groundnut", "sorghum", "maize", "cashew"],
  clay: ["rice", "wheat", "barley", "mustard", "onion"],
  loamy: ["tomato", "potato", "onion", "wheat", "maize"],
  sandy: ["groundnut", "millet", "mustard", "chickpea", "watermelon"],
  saline: ["barley", "mustard", "sorghum", "cotton", "sunflower"],
  alkaline: ["barley", "mustard", "chickpea", "cotton", "sorghum"],
  rocky: ["millet", "sorghum", "pigeonpea", "groundnut", "sunflower"],
  silty: ["rice", "wheat", "maize", "mustard", "potato"],
};

const WATER_PRIORITY: Record<string, string[]> = {
  low: ["millet", "sorghum", "chickpea", "mustard", "groundnut", "pigeonpea"],
  medium: ["wheat", "maize", "soybean", "tomato", "onion", "potato"],
  high: ["rice", "sugarcane", "cotton", "tomato", "potato"],
};

const SEASON_PRIORITY: Record<string, string[]> = {
  kharif: ["rice", "maize", "cotton", "soybean", "groundnut", "pigeonpea"],
  rabi: ["wheat", "chickpea", "mustard", "barley", "lentil", "potato"],
  zaid: ["maize", "groundnut", "tomato", "onion", "sunflower"],
};

const DEFAULT_CROPS = [
  "rice",
  "wheat",
  "maize",
  "millet",
  "groundnut",
  "mustard",
  "tomato",
  "potato",
  "chickpea",
];

const buildRuleBasedRecommendations = (farmData: FarmData): CropRecommendation[] => {
  const soil = cleanText(farmData.soilType, "loamy").toLowerCase();
  const water = cleanText(farmData.waterAvailability, "medium").toLowerCase();
  const season = cleanText(farmData.season, "kharif").toLowerCase();
  const purpose = cleanText(farmData.purpose, "commercial").toLowerCase();
  const budget = Math.max(0, cleanNumber(farmData.budget, 0));

  const candidates = [
    ...(SOIL_PRIORITY[soil] || []),
    ...(WATER_PRIORITY[water] || []),
    ...(SEASON_PRIORITY[season] || []),
    ...DEFAULT_CROPS,
  ];

  const picked: string[] = [];
  for (const cropName of candidates) {
    if (!CROP_PROFILES[cropName]) continue;
    if (!picked.includes(cropName)) picked.push(cropName);
    if (picked.length === 5) break;
  }

  while (picked.length < 5) {
    const next = DEFAULT_CROPS.find((cropName) => !picked.includes(cropName) && CROP_PROFILES[cropName]);
    if (!next) break;
    picked.push(next);
  }

  const budgetFactor = budget > 0 ? Math.min(1.25, Math.max(0.75, budget / 120000)) : 1;
  const roiAdjustment = purpose.includes("commercial") ? 5 : purpose.includes("self") ? -3 : 0;

  return picked.slice(0, 5).map((cropName) => {
    const profile = CROP_PROFILES[cropName];
    return {
      crop_name: cropName.charAt(0).toUpperCase() + cropName.slice(1),
      suitability_reason: `${cropName.charAt(0).toUpperCase() + cropName.slice(1)} fits ${soil} soil and ${season} season with ${water} water availability.`,
      estimated_cost: Math.max(6000, Math.round(profile.estimated_cost * budgetFactor)),
      expected_roi: Math.max(20, Math.min(95, profile.expected_roi + roiAdjustment)),
      growth_duration: profile.growth_duration,
      water_requirement: profile.water_requirement,
      difficulty_level: profile.difficulty_level,
    };
  });
};

type CropScoredItem = CropRecommendation & { qualityScore: number };

const scoreCrop = (crop: CropRecommendation, farmData: FarmData): CropScoredItem => {
  let score = 50;

  const soil = cleanText(farmData.soilType, "loamy").toLowerCase();
  const water = cleanText(farmData.waterAvailability, "medium").toLowerCase();
  const season = cleanText(farmData.season, "kharif").toLowerCase();
  const budget = Math.max(0, cleanNumber(farmData.budget, 0));

  const normalized = normalizeCommonCropName(crop.crop_name.toLowerCase());

  if (SOIL_PRIORITY[soil]?.some((c) => normalizeCommonCropName(c) === normalized)) {
    score += 15;
  }

  if (SEASON_PRIORITY[season]?.some((c) => normalizeCommonCropName(c) === normalized)) {
    score += 15;
  }

  const cropWaterReq = crop.water_requirement.toLowerCase();
  const normalizedWater = water.includes("high") ? "high" : water.includes("low") ? "low" : "medium";
  if (cropWaterReq === normalizedWater) {
    score += 10;
  } else if (
    (normalizedWater === "medium" && ["low", "high"].includes(cropWaterReq)) ||
    (normalizedWater === "high" && cropWaterReq === "medium")
  ) {
    score += 5;
  }

  if (budget > 0 && crop.estimated_cost <= budget * 1.2) {
    score += 5;
  } else if (budget > 0 && crop.estimated_cost <= budget * 1.5) {
    score += 2;
  }

  if (crop.expected_roi >= 50) {
    score += 5;
  } else if (crop.expected_roi >= 40) {
    score += 3;
  }

  if (crop.difficulty_level === "easy") {
    score += 3;
  }

  return { ...crop, qualityScore: Math.min(100, score) };
};

const deduplicateAndSort = (crops: CropRecommendation[], farmData: FarmData): CropRecommendation[] => {
  const seen = new Set<string>();
  const scored: CropScoredItem[] = [];

  for (const crop of crops) {
    const normalized = normalizeCommonCropName(crop.crop_name.toLowerCase());
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    const scored_crop = scoreCrop(crop, farmData);
    scored.push(scored_crop);
  }

  return scored
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 5)
    .map(({ qualityScore, ...rest }) => rest);
};

const saveCachedRecommendations = async (
  cacheKey: string,
  farmData: FarmData,
  crops: CropRecommendation[]
) => {
  const cfg = getCacheConfig();
  if (!cfg) return;

  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const payload = [{
    cache_key: cacheKey,
    location: cleanText(farmData.location, "auto"),
    soil_type: cleanText(farmData.soilType, "unknown"),
    budget: Math.max(0, Math.round(cleanNumber(farmData.budget, 0))),
    response_data: { crops },
    expires_at: expiresAt,
  }];

  await fetch(`${cfg.supabaseUrl}/rest/v1/crop_recommendation_cache?on_conflict=cache_key`, {
    method: "POST",
    headers: {
      apikey: cfg.serviceRoleKey,
      Authorization: `Bearer ${cfg.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(payload),
  }).catch((error) => {
    console.warn("Cache write skipped:", error);
  });
};

const buildPrompt = (farmData: FarmData) => `You are an expert agricultural advisor AI.

Your task is to recommend the best crops for a farmer based on the given data.

Input Data:
- Location: ${cleanText(farmData.location, "Not provided")}
- Soil Type: ${cleanText(farmData.soilType, "Not provided")}
- Farm Size (in acres): ${cleanNumber(farmData.farmSize, 0)}
- Budget (in INR): ${Math.max(0, Math.round(cleanNumber(farmData.budget, 0)))}
- Water Availability: ${cleanText(farmData.waterAvailability, "Not provided")}
- Season: ${cleanText(farmData.season, "Not provided")}
- Farming Purpose: ${cleanText(farmData.purpose, "commercial")}

Instructions:
1. Analyze all inputs carefully.
2. Recommend exactly 5 crops best suited for the conditions.
3. Consider soil compatibility, climate, water availability, and budget.
4. Ensure recommendations are practical for Indian farming conditions.

For each crop, provide:
- crop_name
- suitability_reason (why this crop is suitable)
- estimated_cost (in INR)
- expected_roi (in percentage)
- growth_duration (in days)
- water_requirement (low/medium/high)
- difficulty_level (easy/medium/hard)

Return ONLY a valid JSON array of exactly 5 objects. No markdown. No extra text.`;

const invokeGemini = async (farmData: FarmData): Promise<CropRecommendation[]> => {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  const geminiModel = Deno.env.get("GEMINI_MODEL") || "gemini-2.0-flash";
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: "You are an expert agricultural advisor AI for Indian farming conditions. Always return valid JSON only.",
          }],
        },
        contents: [{ parts: [{ text: buildPrompt(farmData) }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    throw new Error("AI service temporarily unavailable. Please try again.");
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part?.text || "")
    .join("\n")
    .trim();

  if (!textOutput) {
    throw new Error("Invalid response from AI");
  }

  const cleaned = textOutput.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI returned invalid crop list");
  }

  const normalized = parsed.slice(0, 5).map((item) => normalizeCrop(item as Record<string, unknown>));

  if (normalized.length < 5) {
    throw new Error("AI returned less than 5 crops. Please retry.");
  }

  return normalized;
};

const invokeGroq = async (farmData: FarmData): Promise<CropRecommendation[]> => {
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  const groqModel = Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile";
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is not configured in Supabase secrets");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are an expert agricultural advisor AI for Indian farming conditions. Return valid JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(farmData),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq API error:", response.status, errorText);
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    throw new Error("AI service temporarily unavailable. Please try again.");
  }

  const data = await response.json();
  const content = cleanText(data?.choices?.[0]?.message?.content, "");
  if (!content) {
    throw new Error("Invalid response from AI");
  }

  const cleaned = content.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  const list = Array.isArray(parsed) ? parsed : parsed?.crops;

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("AI returned invalid crop list");
  }

  const normalized = list.slice(0, 5).map((item) => normalizeCrop(item as Record<string, unknown>));
  if (normalized.length < 5) {
    throw new Error("AI returned less than 5 crops. Please retry.");
  }

  return normalized;
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { farmData } = await req.json();
    const normalizedFarmData: FarmData = {
      location: cleanText(farmData?.location, ""),
      soilType: cleanText(farmData?.soilType, ""),
      farmSize: cleanNumber(farmData?.farmSize, 0),
      sizeUnit: cleanText(farmData?.sizeUnit, "acres"),
      budget: cleanNumber(farmData?.budget, 0),
      waterAvailability: cleanText(farmData?.waterAvailability, ""),
      irrigationType: cleanText(farmData?.irrigationType, ""),
      season: cleanText(farmData?.season, ""),
      purpose: cleanText(farmData?.purpose, "commercial"),
    };

    const crops = buildRuleBasedRecommendations(normalizedFarmData);
    const sortedCrops = deduplicateAndSort(crops, normalizedFarmData);

    return new Response(
      JSON.stringify({
        crops: sortedCrops,
        cacheHit: false,
        stale: false,
        provider: "rule-fallback",
        fallbackReason: "demo-mode",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("crop-recommend error:", e);

    const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
    const statusCode = isRateLimitError(e) ? 429 : 500;

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});