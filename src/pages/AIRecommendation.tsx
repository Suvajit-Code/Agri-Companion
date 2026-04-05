import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, FlaskConical, Droplets, Settings2, ChevronRight, ChevronLeft,
  Locate, Leaf, Bug, TrendingUp, CalendarDays, IndianRupee,
  Timer, ShoppingCart, ArrowRight, BarChart3, Check, Sparkles, CloudRain,
  Star, Award, Zap, ThumbsUp, Share2, Download, RefreshCcw,
  Sun, Wind, Thermometer, BarChart2, PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getDemoCropRecommendations } from "@/lib/demoData";

// ── Types ──
interface FormData {
  location: string;
  autoDetect: boolean;
  soilType: string;
  farmSize: number;
  sizeUnit: string;
  budget: number;
  waterAvailability: string;
  irrigationType: string;
  season: string;
  purpose: string;
  riskAppetite: number;
}

const defaultForm: FormData = {
  location: "",
  autoDetect: false,
  soilType: "",
  farmSize: 5,
  sizeUnit: "acres",
  budget: 50000,
  waterAvailability: "",
  irrigationType: "",
  season: "",
  purpose: "commercial",
  riskAppetite: 50,
};


// ── CropResult Type ──
interface CropResult {
  name: string;
  nameHi: string;
  emoji: string;
  score: number;
  yield: string;
  price: string;
  duration: string;
  water: string;
  roi: string;
  investment: string;
  revenue: string;
  profit: string;
  desc: string;
  tags: string[];
  monthlyTimeline: { month: string; activity: string; status: string }[];
  pestRisks: { name: string; risk: string; solution: string }[];
  fertilizerPlan: { stage: string; fertilizer: string; timing: string }[];
}

interface CropRecommendationApiItem {
  crop_name?: string;
  suitability_reason?: string;
  estimated_cost?: string | number;
  expected_roi?: string | number;
  growth_duration?: string | number;
  water_requirement?: string;
  difficulty_level?: string;
  name?: string;
  desc?: string;
  investment?: string;
  roi?: string;
  duration?: string;
  water?: string;
  score?: number;
  yield?: string;
  price?: string;
  revenue?: string;
  profit?: string;
  nameHi?: string;
  emoji?: string;
  tags?: string[];
  monthlyTimeline?: { month: string; activity: string; status: string }[];
  pestRisks?: { name: string; risk: string; solution: string }[];
  fertilizerPlan?: { stage: string; fertilizer: string; timing: string }[];
}

// ── Step data ──
const soilTypes = [
  { id: "alluvial", label: "Alluvial", emoji: "🏞️", desc: "Rich & fertile" },
  { id: "black", label: "Black (Regur)", emoji: "⬛", desc: "Moisture retentive" },
  { id: "red", label: "Red & Yellow", emoji: "🟤", desc: "Iron-rich" },
  { id: "laterite", label: "Laterite", emoji: "🧱", desc: "Acidic, leached" },
  { id: "sandy", label: "Sandy", emoji: "🏜️", desc: "Well-drained" },
  { id: "clay", label: "Clay", emoji: "🫙", desc: "Heavy, compact" },
  { id: "loamy", label: "Loamy", emoji: "🌱", desc: "Ideal balance" },
  { id: "peaty", label: "Peaty", emoji: "🌿", desc: "Organic-rich" },
  { id: "saline", label: "Saline", emoji: "🧂", desc: "Salt-affected" },
  { id: "alkaline", label: "Alkaline", emoji: "⚪", desc: "High pH soil" },
  { id: "rocky", label: "Rocky", emoji: "🪨", desc: "Shallow & coarse" },
  { id: "silty", label: "Silty", emoji: "🌫️", desc: "Fine, smooth texture" },
];

const waterOptions = [
  { id: "abundant", label: "Abundant", icon: "💧💧💧", desc: "Canal/river irrigation available" },
  { id: "moderate", label: "Moderate", icon: "💧💧", desc: "Groundwater/bore well" },
  { id: "limited", label: "Limited", icon: "💧", desc: "Rain-dependent mainly" },
];

const irrigationTypes = [
  { id: "drip", label: "Drip", emoji: "💧", desc: "90% efficiency" },
  { id: "sprinkler", label: "Sprinkler", emoji: "🌧️", desc: "75% efficiency" },
  { id: "flood", label: "Flood", emoji: "🌊", desc: "50% efficiency" },
  { id: "rainfed", label: "Rain-fed", emoji: "🌤️", desc: "Variable" },
];

const seasons = [
  { id: "kharif", label: "Kharif (June–Oct)", emoji: "🌧️", desc: "Monsoon season crops" },
  { id: "rabi", label: "Rabi (Nov–Mar)", emoji: "❄️", desc: "Winter season crops" },
  { id: "zaid", label: "Zaid (Mar–Jun)", emoji: "☀️", desc: "Summer season crops" },
];

// ── Enhanced Results data ──
// cropResults is now dynamic state — set by AI

const steps = [
  { icon: MapPin, label: "Location", title: "Farm Location", subtitle: "Where is your farm located?" },
  { icon: FlaskConical, label: "Soil", title: "Soil Information", subtitle: "Tell us about your soil composition" },
  { icon: Droplets, label: "Resources", title: "Resources & Budget", subtitle: "Water, land & financial capacity" },
  { icon: Settings2, label: "Preferences", title: "Farming Preferences", subtitle: "Season, purpose & risk level" },
];

const loadingMessages = [
  { text: "Analyzing soil conditions...", icon: FlaskConical },
  { text: "Checking weather patterns...", icon: CloudRain },
  { text: "Scanning market trends...", icon: TrendingUp },
  { text: "Calculating ROI projections...", icon: BarChart3 },
  { text: "Generating recommendations...", icon: Sparkles },
];

const cropEmojiMap: Record<string, string> = {
  rice: "🌾",
  wheat: "🌾",
  maize: "🌽",
  corn: "🌽",
  cotton: "☁️",
  sugarcane: "🎋",
  soybean: "🫘",
  mustard: "🌻",
  groundnut: "🥜",
  potato: "🥔",
  onion: "🧅",
  tomato: "🍅",
  chili: "🌶️",
  chilli: "🌶️",
  turmeric: "🟡",
  pulses: "🫘",
};

const sanitizeNumber = (value: string | number | undefined, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return fallback;
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toCurrencyLabel = (amount: number) => `₹${Math.max(0, Math.round(amount)).toLocaleString("en-IN")}`;

const buildTimeline = (durationLabel: string) => {
  const totalDays = Math.max(90, sanitizeNumber(durationLabel, 120));
  const monthCount = Math.max(3, Math.min(6, Math.round(totalDays / 30)));
  const statuses = ["start", "grow", "grow", "flower", "fruit", "harvest"];
  const activities = ["Land Prep & Sowing", "Vegetative Growth", "Canopy Development", "Flowering", "Grain/Fruit Filling", "Harvest"];
  const monthNames = ["M1", "M2", "M3", "M4", "M5", "M6"];

  return Array.from({ length: monthCount }, (_, idx) => ({
    month: monthNames[idx],
    activity: activities[idx],
    status: statuses[idx],
  }));
};

const mapApiCropToUiCrop = (item: CropRecommendationApiItem, season: string): CropResult => {
  if (item.name && item.desc && item.investment && item.roi && item.duration && item.water) {
    return {
      name: item.name,
      nameHi: item.nameHi || item.name,
      emoji: item.emoji || "🌱",
      score: item.score || 85,
      yield: item.yield || "Good yield potential",
      price: item.price || "Market-linked",
      duration: item.duration,
      water: item.water,
      roi: item.roi,
      investment: item.investment,
      revenue: item.revenue || "As per market",
      profit: item.profit || "Varies by mandi rate",
      desc: item.desc,
      tags: item.tags || [season || "season", "AI Recommended"],
      monthlyTimeline: item.monthlyTimeline || buildTimeline(item.duration),
      pestRisks: item.pestRisks || [
        { name: "Leaf Spot", risk: "Medium", solution: "Regular field scouting and preventive spray" },
        { name: "Aphid", risk: "Low", solution: "Neem-based spray and sticky traps" },
      ],
      fertilizerPlan: item.fertilizerPlan || [
        { stage: "Basal", fertilizer: "NPK as per local recommendation", timing: "At sowing" },
        { stage: "Top Dress", fertilizer: "Nitrogen split dose", timing: "20-30 DAS" },
      ],
    };
  }

  const cropName = (item.crop_name || "Recommended Crop").trim();
  const key = cropName.toLowerCase();
  const emoji = Object.entries(cropEmojiMap).find(([k]) => key.includes(k))?.[1] || "🌱";
  const estimatedCost = sanitizeNumber(item.estimated_cost, 15000);
  const roiValue = sanitizeNumber(item.expected_roi, 80);
  const projectedRevenue = estimatedCost * (1 + roiValue / 100);
  const projectedProfit = projectedRevenue - estimatedCost;
  const durationRaw = item.growth_duration ?? "120";
  const durationLabel = String(durationRaw).toLowerCase().includes("day")
    ? String(durationRaw)
    : `${sanitizeNumber(durationRaw, 120)} days`;
  const water = (item.water_requirement || "medium").toLowerCase();
  const difficulty = (item.difficulty_level || "medium").toLowerCase();

  return {
    name: cropName,
    nameHi: cropName,
    emoji,
    score: Math.max(60, Math.min(98, Math.round(60 + roiValue * 0.35))),
    yield: difficulty === "hard" ? "Moderate to high (with management)" : "Stable yield potential",
    price: `Est. Cost ${toCurrencyLabel(estimatedCost)}`,
    duration: durationLabel,
    water: water.charAt(0).toUpperCase() + water.slice(1),
    roi: `${Math.max(0, Math.round(roiValue))}%`,
    investment: toCurrencyLabel(estimatedCost),
    revenue: toCurrencyLabel(projectedRevenue),
    profit: toCurrencyLabel(projectedProfit),
    desc: item.suitability_reason || `${cropName} is suitable for the given farm inputs and current season.`,
    tags: [
      `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
      `Water: ${water.charAt(0).toUpperCase() + water.slice(1)}`,
      season || "Season-specific",
    ],
    monthlyTimeline: buildTimeline(durationLabel),
    pestRisks: [
      { name: "Common Pest Pressure", risk: difficulty === "hard" ? "High" : "Medium", solution: "Weekly scouting and integrated pest management" },
      { name: "Fungal Risk", risk: water === "high" ? "Medium" : "Low", solution: "Seed treatment and drainage management" },
    ],
    fertilizerPlan: [
      { stage: "Basal", fertilizer: "Organic manure + starter dose", timing: "At sowing" },
      { stage: "Vegetative", fertilizer: "Balanced nutrient top dress", timing: "20-30 DAS" },
      { stage: "Reproductive", fertilizer: "Potash-focused support", timing: "45-60 DAS" },
    ],
  };
};

// ── Component ──
export default function AIRecommendation() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [selectedCrop, setSelectedCrop] = useState<number>(0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [cropResults, setCropResults] = useState<CropResult[]>([]);

  const update = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleAutoDetectToggle = useCallback(async () => {
    const nextState = !form.autoDetect;
    update("autoDetect", nextState);

    if (!nextState) {
      return;
    }

    if (!("geolocation" in navigator)) {
      update("autoDetect", false);
      toast({
        title: "GPS not supported",
        description: "Your browser does not support geolocation. Please enter location manually.",
        variant: "destructive",
      });
      return;
    }

    setDetectingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 300000,
        });
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const fallbackLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      let detectedLocation = fallbackLocation;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
        );

        if (response.ok) {
          const result = await response.json();
          const addr = result?.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || "";
          const state = addr.state || "";
          const country = addr.country || "India";

          if (city && state) {
            detectedLocation = `${city}, ${state}`;
          } else if (state) {
            detectedLocation = `${state}, ${country}`;
          }
        }
      } catch {
        // Keep coordinate fallback when reverse geocoding fails.
      }

      update("location", detectedLocation);
      toast({
        title: "Location detected",
        description: `Using ${detectedLocation} for recommendations.`,
      });
    } catch (error) {
      update("autoDetect", false);
      let message = "Could not detect your location. Please enter location manually.";

      if (typeof error === "object" && error && "code" in error) {
        const geolocationError = error as GeolocationPositionError;
        if (geolocationError.code === 1) {
          message = "Location permission denied. Please allow GPS access or enter location manually.";
        } else if (geolocationError.code === 2) {
          message = "Location unavailable. Please check network/GPS and try again.";
        } else if (geolocationError.code === 3) {
          message = "Location request timed out. Please try again or enter manually.";
        }
      }

      toast({
        title: "GPS detection failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDetectingLocation(false);
    }
  }, [form.autoDetect, toast, update]);

  const canProceed = () => {
    switch (currentStep) {
      case 0: return form.location.trim().length > 0 || form.autoDetect;
      case 1: return form.soilType.length > 0;
      case 2: return form.waterAvailability.length > 0 && form.irrigationType.length > 0;
      case 3: return form.season.length > 0;
      default: return true;
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingIdx(0);

    // Animate loading messages while waiting for AI
    const interval = setInterval(() => {
      setLoadingIdx((prev) => {
        if (prev >= loadingMessages.length - 1) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 800);

    try {
      const data = {
        crops: getDemoCropRecommendations(form),
      };

      // Keep a short delay so loading UI does not feel abrupt.
      await new Promise((resolve) => setTimeout(resolve, 1200));

      clearInterval(interval);
      if (!data?.crops || !Array.isArray(data.crops)) throw new Error("Invalid response from AI");

      const mappedResults = (data.crops as CropRecommendationApiItem[])
        .slice(0, 5)
        .map((item) => mapApiCropToUiCrop(item, form.season));

      if (mappedResults.length === 0) {
        throw new Error("No crop recommendations generated");
      }

      setCropResults(mappedResults);
      setLoading(false);
      setShowResults(true);
    } catch (err) {
      clearInterval(interval);
      setLoading(false);
      toast({
        title: "AI Recommendation Failed",
        description: err instanceof Error ? err.message : "Could not get recommendations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setForm(defaultForm);
    setCurrentStep(0);
    setShowResults(false);
    setSelectedCrop(0);
    setCompareMode(false);
    setCompareList([]);
    setCropResults([]);
  };

  const toggleCompare = (idx: number) => {
    setCompareList((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : prev.length < 3 ? [...prev, idx] : prev
    );
  };

  // ── Loading screen ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <div className="relative w-28 h-28 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="w-28 h-28 rounded-full gradient-hero flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-accent" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full border-2 border-primary/30"
            />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">AI is Analyzing Your Farm</h2>
          <p className="text-sm text-muted-foreground mb-8">Processing 5 data layers for accurate recommendations</p>
          <div className="space-y-3 max-w-xs mx-auto">
            {loadingMessages.map((msg, i) => (
              <motion.div
                key={msg.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: i <= loadingIdx ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-sm"
              >
                {i < loadingIdx ? (
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-success" />
                  </div>
                ) : i === loadingIdx ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
                )}
                <span className={i <= loadingIdx ? "text-foreground font-medium" : "text-muted-foreground"}>{msg.text}</span>
              </motion.div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="mt-8 max-w-xs mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-hero rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((loadingIdx + 1) / loadingMessages.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{Math.round(((loadingIdx + 1) / loadingMessages.length) * 100)}% complete</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Results screen ──
  if (showResults) {
    const crop = cropResults[selectedCrop];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-foreground">AI Crop Recommendations</h1>
            </div>
            <p className="text-sm text-muted-foreground">5 crops analyzed · Ranked by suitability for your farm</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCompareMode(!compareMode)}>
              <BarChart2 className="w-4 h-4 mr-1" /> {compareMode ? "Exit Compare" : "Compare"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCcw className="w-4 h-4 mr-1" /> New Analysis
            </Button>
          </div>
        </div>

        {/* AI Confidence Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-4 border border-success/20 bg-success/5"
        >
          <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">AI Confidence: 92% — Based on 12 data points</p>
            <p className="text-xs text-muted-foreground">Weather data, market trends, soil analysis, and historical yields considered</p>
          </div>
          <div className="hidden sm:flex gap-3 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground"><Sun className="w-3.5 h-3.5" /> 28°C avg</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Wind className="w-3.5 h-3.5" /> 12 km/h</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Thermometer className="w-3.5 h-3.5" /> Ideal</span>
          </div>
        </motion.div>

        {/* Compare Mode */}
        {compareMode && compareList.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="glass-card rounded-2xl p-5 mb-6 overflow-hidden"
          >
            <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Comparison View
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Metric</th>
                    {compareList.map((idx) => (
                      <th key={idx} className="text-left py-2 px-3 text-foreground font-medium">
                        {cropResults[idx].emoji} {cropResults[idx].name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { label: "Score", key: "score", suffix: "%" },
                    { label: "ROI", key: "roi" },
                    { label: "Yield", key: "yield" },
                    { label: "Duration", key: "duration" },
                    { label: "Water Need", key: "water" },
                    { label: "Investment", key: "investment" },
                    { label: "Revenue", key: "revenue" },
                    { label: "Profit", key: "profit" },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="py-2 pr-4 text-muted-foreground">{row.label}</td>
                      {compareList.map((idx) => (
                        <td key={idx} className="py-2 px-3 font-medium text-foreground">
                          {(cropResults[idx] as any)[row.key]}{row.suffix || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Crop cards */}
          <div className="lg:col-span-2 space-y-3">
            {cropResults.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => !compareMode && setSelectedCrop(i)}
                className={`glass-card-hover rounded-2xl p-5 cursor-pointer border-2 transition-all ${
                  compareMode
                    ? compareList.includes(i) ? "border-primary bg-primary/5" : "border-transparent"
                    : selectedCrop === i ? "border-primary" : "border-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  {compareMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleCompare(i); }}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        compareList.includes(i) ? "bg-primary border-primary" : "border-border"
                      }`}
                    >
                      {compareList.includes(i) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </button>
                  )}
                  <div className="text-4xl">{c.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-heading font-bold text-lg text-foreground">{c.name}</h3>
                      <span className="text-sm text-muted-foreground">{c.nameHi}</span>
                      {i === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full gradient-warm text-secondary-foreground font-semibold flex items-center gap-1">
                          <Star className="w-3 h-3" /> Top Pick
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{c.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {c.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{tag}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <Stat icon={BarChart3} label="Yield" value={c.yield} />
                      <Stat icon={IndianRupee} label="Price" value={c.price} />
                      <Stat icon={Timer} label="Duration" value={c.duration} />
                      <Stat icon={TrendingUp} label="ROI" value={c.roi} accent />
                    </div>
                  </div>
                  <div className="shrink-0 hidden sm:block">
                    <ScoreRing score={c.score} />
                  </div>
                </div>
              </motion.div>
            ))}

            {compareMode && (
              <p className="text-xs text-center text-muted-foreground">Select 2-3 crops to compare side by side</p>
            )}
          </div>

          {/* Right: Detail panel */}
          <div className="space-y-4">
            {/* Farm Profile */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Your Farm Profile
              </h3>
              <div className="space-y-2 text-sm">
                <ProfileRow label="Location" value={form.autoDetect ? "Auto-detected" : form.location} />
                <ProfileRow label="Soil" value={soilTypes.find((s) => s.id === form.soilType)?.label || "—"} />
                <ProfileRow label="Farm Size" value={`${form.farmSize} ${form.sizeUnit}`} />
                <ProfileRow label="Budget" value={`₹${form.budget.toLocaleString()}`} />
                <ProfileRow label="Water" value={form.waterAvailability || "—"} />
                <ProfileRow label="Irrigation" value={form.irrigationType || "—"} />
                <ProfileRow label="Season" value={form.season || "—"} />
              </div>
            </div>

            {/* Selected Crop Detail */}
            <motion.div
              key={selectedCrop}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group rounded-2xl overflow-hidden backdrop-blur-sm"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 group-hover:from-primary/10 group-hover:to-accent/10 transition-colors duration-300" />
              
              {/* Border */}
              <div className="absolute inset-0 border border-primary/10 group-hover:border-primary/20 transition-colors duration-300 rounded-2xl" />
              
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-3">
                    <span className="text-3xl">{crop.emoji}</span>
                    {crop.name} — Deep Dive
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs font-medium"
                      onClick={() => {
                        const text = `${crop.name}\n${crop.desc}`;
                        navigator.clipboard.writeText(text);
                        toast({ title: "Copied to clipboard!" });
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs font-medium"
                      onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob([`${crop.name}\n\n${crop.desc}`], { type: "text/plain" });
                        element.href = URL.createObjectURL(file);
                        element.download = `${crop.name.toLowerCase().replace(/\s+/g, "-")}.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        toast({ title: "Download started!" });
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full mb-6 grid grid-cols-3 bg-muted/30 p-1 rounded-lg">
                    <TabsTrigger value="overview" className="text-xs font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Overview</TabsTrigger>
                    <TabsTrigger value="timeline" className="text-xs font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Timeline</TabsTrigger>
                    <TabsTrigger value="costs" className="text-xs font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Costs</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-3 text-sm text-muted-foreground">
                    <DetailSection icon={CalendarDays} title="Growth Timeline">
                      {crop.duration} from sowing to harvest. Best planted at the start of {form.season || "Rabi"} season.
                    </DetailSection>
                    <DetailSection icon={Bug} title="Pest Risks">
                      <div className="space-y-1.5 mt-1">
                        {crop.pestRisks.map((p) => (
                          <div key={p.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30">
                            <span className="font-medium text-foreground">{p.name}</span>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                              p.risk === "High" ? "bg-destructive/20 text-destructive" : p.risk === "Medium" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                            }`}>{p.risk}</span>
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                    <DetailSection icon={Leaf} title="Fertilizer Schedule">
                      <div className="space-y-1.5 mt-1">
                        {crop.fertilizerPlan.map((f) => (
                          <div key={f.stage} className="text-xs p-2 rounded-lg bg-muted/30">
                            <span className="font-semibold text-foreground">{f.stage}:</span> <span className="text-muted-foreground">{f.fertilizer}</span> — <span className="text-xs text-muted-foreground/70">{f.timing}</span>
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                    <DetailSection icon={CloudRain} title="Water Needs">
                      {crop.water} water requirement. Critical irrigation at flowering and pod/fruit formation.
                    </DetailSection>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-3">
                    {crop.monthlyTimeline.map((t, i) => (
                      <motion.div
                        key={t.month}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 hover:border-primary/20 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                          t.status === "harvest" ? "gradient-warm text-white"
                          : t.status === "flower" ? "bg-accent/20 text-accent font-semibold"
                          : t.status === "start" ? "gradient-hero text-white"
                          : "bg-primary/15 text-primary font-semibold"
                        }`}>
                          {t.month.slice(0, 3)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{t.activity}</p>
                        </div>
                      </motion.div>
                    ))}
                  </TabsContent>

                  <TabsContent value="costs" className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-primary/10 hover:border-primary/20 transition-colors">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-primary" />
                          Investment
                        </span>
                        <span className="text-lg font-bold text-foreground">{crop.investment}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-primary/10 hover:border-primary/20 transition-colors">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-accent" />
                          Expected Revenue
                        </span>
                        <span className="text-lg font-bold text-foreground">{crop.revenue}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
                        <span className="text-sm font-semibold text-success flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Net Profit
                        </span>
                        <span className="text-lg font-bold text-success">{crop.profit}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-xl gradient-hero text-white border border-primary/30">
                        <span className="text-sm font-semibold flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          ROI
                        </span>
                        <span className="text-xl font-bold">{crop.roi}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center italic">*Estimates based on current MSP and market rates. Actual results may vary.</p>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-6 pt-4 border-t border-primary/10">
                  <Button className="flex-1 gradient-warm text-white border-0 hover:opacity-90 font-medium gap-2" size="sm">
                    <ShoppingCart className="w-4 h-4" />
                    Buy Seeds
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Wizard ──
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">AI Crop Recommendation</h1>
            <p className="text-sm text-muted-foreground">Tell us about your farm — our AI will find the best crops for you.</p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => i < currentStep && setCurrentStep(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                i === currentStep
                  ? "gradient-hero text-primary-foreground shadow-md"
                  : i < currentStep
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < currentStep ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="glass-card rounded-2xl p-6 md:p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-heading font-semibold text-foreground">{steps[currentStep].title}</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Step {currentStep + 1}/4</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{steps[currentStep].subtitle}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep === 0 && (
              <StepLocation
                form={form}
                update={update}
                detectingLocation={detectingLocation}
                onAutoDetectToggle={handleAutoDetectToggle}
              />
            )}
            {currentStep === 1 && <StepSoil form={form} update={update} />}
            {currentStep === 2 && <StepResources form={form} update={update} />}
            {currentStep === 3 && <StepPreferences form={form} update={update} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
              className="gradient-hero text-primary-foreground border-0 hover:opacity-90"
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleAnalyze}
              disabled={!canProceed()}
              className="gradient-warm text-secondary-foreground border-0 hover:opacity-90"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Get AI Recommendations
            </Button>
          )}
        </div>
      </div>

      {/* Tips section */}
      <div className="mt-6 max-w-3xl">
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Zap, title: "Quick Tip", desc: "Auto-detect location for weather-adjusted results" },
            { icon: ThumbsUp, title: "Best Practice", desc: "Choose accurate soil type and water availability for better recommendations" },
            { icon: Leaf, title: "Pro Tip", desc: "Try multiple seasons to compare year-round options" },
          ].map((tip) => (
            <div key={tip.title} className="glass-card rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <tip.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{tip.title}</p>
                <p className="text-[11px] text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Step Components ──

function StepLocation({
  form,
  update,
  detectingLocation,
  onAutoDetectToggle,
}: {
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  detectingLocation: boolean;
  onAutoDetectToggle: () => void;
}) {
  return (
    <div className="space-y-5">
      <button
        onClick={onAutoDetectToggle}
        disabled={detectingLocation}
        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
          form.autoDetect ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
        } ${detectingLocation ? "opacity-80 cursor-wait" : ""}`}
      >
        <div className={`w-10 h-10 rounded-lg ${form.autoDetect ? "bg-primary/15" : "bg-muted"} flex items-center justify-center`}>
          <Locate className={`w-5 h-5 ${form.autoDetect ? "text-primary" : "text-muted-foreground"} ${detectingLocation ? "animate-pulse" : ""}`} />
        </div>
        <div className="text-left">
          <p className="font-medium text-sm text-foreground">Auto-detect my location</p>
          <p className="text-xs text-muted-foreground">
            {detectingLocation ? "Detecting your location..." : "Use GPS to automatically find your farm location"}
          </p>
        </div>
        {form.autoDetect && !detectingLocation && <Check className="w-5 h-5 text-primary ml-auto" />}
      </button>

      <div className="relative">
        <label className="text-sm font-medium text-foreground mb-1.5 block">Or enter location manually</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="e.g., Indore, Madhya Pradesh"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            maxLength={200}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>
    </div>
  );
}

function StepSoil({ form, update }: { form: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Soil Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {soilTypes.map((soil) => (
            <button
              key={soil.id}
              onClick={() => update("soilType", soil.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                form.soilType === soil.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <span className="text-2xl">{soil.emoji}</span>
              <span className="text-xs font-medium text-foreground">{soil.label}</span>
              <span className="text-[10px] text-muted-foreground">{soil.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepResources({ form, update }: { form: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Farm Size</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={form.farmSize}
              onChange={(e) => update("farmSize", Math.max(0, Number(e.target.value)))}
              min={0}
              max={10000}
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <div className="flex rounded-xl border border-border overflow-hidden">
              {["acres", "hectares"].map((u) => (
                <button
                  key={u}
                  onClick={() => update("sizeUnit", u)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    form.sizeUnit === u ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
        <SliderField
          label="Budget"
          value={form.budget}
          onChange={(v) => update("budget", v)}
          min={5000} max={500000} step={5000}
          format={(v) => `₹${v.toLocaleString()}`}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Water Availability</label>
        <div className="grid sm:grid-cols-3 gap-3">
          {waterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => update("waterAvailability", opt.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                form.waterAvailability === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <span className="text-xl">{opt.icon}</span>
              <span className="text-sm font-medium text-foreground">{opt.label}</span>
              <span className="text-xs text-muted-foreground text-center">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Irrigation Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {irrigationTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => update("irrigationType", t.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                form.irrigationType === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-xs font-medium text-foreground">{t.label}</span>
              <span className="text-[10px] text-muted-foreground">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPreferences({ form, update }: { form: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Season</label>
        <div className="grid sm:grid-cols-3 gap-3">
          {seasons.map((s) => (
            <button
              key={s.id}
              onClick={() => update("season", s.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                form.season === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-sm font-medium text-foreground">{s.label}</span>
              <span className="text-xs text-muted-foreground">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Crop Purpose</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "commercial", label: "Commercial", emoji: "💰", desc: "Market selling" },
            { id: "personal", label: "Personal", emoji: "🏡", desc: "Self consumption" },
            { id: "mixed", label: "Mixed", emoji: "🔄", desc: "Both" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => update("purpose", p.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                form.purpose === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <span className="text-xl">{p.emoji}</span>
              <span className="text-xs font-medium text-foreground">{p.label}</span>
              <span className="text-[10px] text-muted-foreground">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <SliderField
        label="Risk Appetite"
        value={form.riskAppetite}
        onChange={(v) => update("riskAppetite", v)}
        min={0} max={100}
        format={(v) => v <= 30 ? "🛡️ Low — Safe, stable returns" : v <= 70 ? "⚖️ Medium — Balanced risk/reward" : "🚀 High — Maximum profit potential"}
      />
    </div>
  );
}

// ── Utility Components ──

function SliderField({
  label, value, onChange, min, max, step = 1, format, hint,
}: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number;
  format?: (v: number) => string; hint?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-sm font-mono text-primary font-medium">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
      />
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r="30" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
        <motion.circle
          cx="34" cy="34" r="30" fill="none"
          stroke={score >= 90 ? "hsl(var(--success))" : score >= 80 ? "hsl(var(--primary))" : "hsl(var(--warning))"}
          strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono font-bold text-foreground text-sm">{score}%</span>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-muted/50 rounded-lg p-2">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className={`font-medium ${accent ? "text-success" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function DetailSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-primary" />
        <span className="font-medium text-foreground text-sm">{title}</span>
      </div>
      <div className="text-sm leading-relaxed pl-6">{children}</div>
    </div>
  );
}