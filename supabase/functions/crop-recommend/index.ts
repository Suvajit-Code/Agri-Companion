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

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { farmData } = await req.json();

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured in Supabase secrets");

    const prompt = `You are an expert agricultural advisor for Indian farmers.
Based on the farm details below, recommend the top 5 most suitable crops.

=== FARM DETAILS ===
Location: ${farmData.location || "Not specified"}
Soil Type: ${farmData.soilType}
pH Level: ${farmData.phLevel}
Nitrogen: ${farmData.nitrogen} kg/ha
Phosphorus: ${farmData.phosphorus} kg/ha
Potassium: ${farmData.potassium} kg/ha
Farm Size: ${farmData.farmSize} ${farmData.sizeUnit}
Budget: ₹${farmData.budget}
Water Availability: ${farmData.waterAvailability}
Irrigation Type: ${farmData.irrigationType}
Season: ${farmData.season}
Purpose: ${farmData.purpose}
Risk Appetite: ${farmData.riskAppetite}/100

=== INSTRUCTIONS ===
Respond ONLY with a valid JSON array. No extra text, no markdown, no explanation.
Return exactly 5 crops sorted by suitability score (highest first).

Use this exact JSON structure:
[
  {
    "name": "Wheat",
    "nameHi": "गेहूँ",
    "emoji": "🌾",
    "score": 89,
    "yield": "20-25 quintal/acre",
    "price": "₹2,275–₹2,800/quintal",
    "duration": "120-150 days",
    "water": "Moderate",
    "roi": "128%",
    "investment": "₹15,000/acre",
    "revenue": "₹62,000/acre",
    "profit": "₹47,000/acre",
    "desc": "One sentence explaining why this crop suits this specific farm.",
    "tags": ["Tag1", "Tag2", "Tag3"],
    "monthlyTimeline": [
      { "month": "Nov", "activity": "Sowing", "status": "start" },
      { "month": "Dec", "activity": "Tillering", "status": "grow" },
      { "month": "Jan", "activity": "Jointing", "status": "grow" },
      { "month": "Feb", "activity": "Heading", "status": "flower" },
      { "month": "Mar", "activity": "Harvest", "status": "harvest" }
    ],
    "pestRisks": [
      { "name": "Yellow Rust", "risk": "High", "solution": "Propiconazole spray" },
      { "name": "Aphid", "risk": "Medium", "solution": "Dimethoate 30 EC" }
    ],
    "fertilizerPlan": [
      { "stage": "Basal", "fertilizer": "DAP 50kg/acre + MOP 25kg", "timing": "At sowing" },
      { "stage": "1st Top dress", "fertilizer": "Urea 35kg/acre", "timing": "21 DAS" },
      { "stage": "2nd Top dress", "fertilizer": "Urea 35kg/acre", "timing": "45 DAS" }
    ]
  }
]

Status values for monthlyTimeline must be one of: "start", "grow", "flower", "fruit", "harvest"
Risk values for pestRisks must be one of: "Low", "Medium", "High"
Emoji should match the crop realistically.
Score should be between 60-98 based on suitability.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are an expert Indian agricultural advisor. You always respond with valid JSON only — no markdown, no explanation, no preamble.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawText = data.choices[0].message.content.trim();

    // Safely parse JSON — strip markdown fences if present
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const crops = JSON.parse(cleaned);

    return new Response(
      JSON.stringify({ crops }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("crop-recommend error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});