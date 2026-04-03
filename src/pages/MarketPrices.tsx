import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Filter, IndianRupee, BarChart3, MapPin, Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface CropPrice {
  id: number;
  name: string;
  nameHi: string;
  emoji: string;
  price: number;
  unit: string;
  change24h: number;
  mandi: string;
  state: string;
  category: string;
  history: { date: string; price: number }[];
}

const crops: CropPrice[] = [
  // Vegetables
  { id: 1, name: "Tomato", nameHi: "टमाटर", emoji: "🍅", price: 2800, unit: "kg", change24h: 8.5, mandi: "Azadpur", state: "Delhi", category: "Vegetables",
    history: [{ date: "Mon", price: 2200 }, { date: "Tue", price: 2400 }, { date: "Wed", price: 2500 }, { date: "Thu", price: 2600 }, { date: "Fri", price: 2700 }, { date: "Sat", price: 2800 }] },
  { id: 2, name: "Onion", nameHi: "प्याज़", emoji: "🧅", price: 2400, unit: "kg", change24h: 5.2, mandi: "Lasalgaon", state: "Maharashtra", category: "Vegetables",
    history: [{ date: "Mon", price: 2200 }, { date: "Tue", price: 2250 }, { date: "Wed", price: 2300 }, { date: "Thu", price: 2320 }, { date: "Fri", price: 2370 }, { date: "Sat", price: 2400 }] },
  { id: 3, name: "Potato", nameHi: "आलू", emoji: "🥔", price: 1800, unit: "kg", change24h: -2.1, mandi: "Kolkata", state: "West Bengal", category: "Vegetables",
    history: [{ date: "Mon", price: 1900 }, { date: "Tue", price: 1880 }, { date: "Wed", price: 1860 }, { date: "Thu", price: 1840 }, { date: "Fri", price: 1820 }, { date: "Sat", price: 1800 }] },
  { id: 4, name: "Cabbage", nameHi: "पत्तागोभी", emoji: "🥬", price: 1200, unit: "kg", change24h: 3.4, mandi: "Bangalore", state: "Karnataka", category: "Vegetables",
    history: [{ date: "Mon", price: 1100 }, { date: "Tue", price: 1120 }, { date: "Wed", price: 1150 }, { date: "Thu", price: 1170 }, { date: "Fri", price: 1190 }, { date: "Sat", price: 1200 }] },
  { id: 5, name: "Carrot", nameHi: "गाजर", emoji: "🥕", price: 1600, unit: "kg", change24h: 1.8, mandi: "Pune", state: "Maharashtra", category: "Vegetables",
    history: [{ date: "Mon", price: 1550 }, { date: "Tue", price: 1560 }, { date: "Wed", price: 1575 }, { date: "Thu", price: 1585 }, { date: "Fri", price: 1595 }, { date: "Sat", price: 1600 }] },
  { id: 6, name: "Cucumber", nameHi: "ककड़ी", emoji: "🥒", price: 1400, unit: "kg", change24h: -4.2, mandi: "Chennai", state: "Tamil Nadu", category: "Vegetables",
    history: [{ date: "Mon", price: 1500 }, { date: "Tue", price: 1480 }, { date: "Wed", price: 1460 }, { date: "Thu", price: 1440 }, { date: "Fri", price: 1420 }, { date: "Sat", price: 1400 }] },
  { id: 7, name: "Brinjal", nameHi: "बैंगन", emoji: "🍆", price: 2200, unit: "kg", change24h: 6.1, mandi: "Hyderabad", state: "Telangana", category: "Vegetables",
    history: [{ date: "Mon", price: 2000 }, { date: "Tue", price: 2050 }, { date: "Wed", price: 2100 }, { date: "Thu", price: 2150 }, { date: "Fri", price: 2175 }, { date: "Sat", price: 2200 }] },
  { id: 8, name: "Capsicum", nameHi: "शिमला मिर्च", emoji: "🫑", price: 3200, unit: "kg", change24h: 7.3, mandi: "Mumbai", state: "Maharashtra", category: "Vegetables",
    history: [{ date: "Mon", price: 2800 }, { date: "Tue", price: 2900 }, { date: "Wed", price: 3000 }, { date: "Thu", price: 3100 }, { date: "Fri", price: 3150 }, { date: "Sat", price: 3200 }] },
  { id: 9, name: "Cauliflower", nameHi: "फूलगोभी", emoji: "🥦", price: 1500, unit: "kg", change24h: 2.5, mandi: "Jaipur", state: "Rajasthan", category: "Vegetables",
    history: [{ date: "Mon", price: 1450 }, { date: "Tue", price: 1460 }, { date: "Wed", price: 1475 }, { date: "Thu", price: 1490 }, { date: "Fri", price: 1495 }, { date: "Sat", price: 1500 }] },
  { id: 10, name: "Spinach", nameHi: "पालक", emoji: "🌿", price: 800, unit: "kg", change24h: -1.2, mandi: "Lucknow", state: "Uttar Pradesh", category: "Vegetables",
    history: [{ date: "Mon", price: 820 }, { date: "Tue", price: 815 }, { date: "Wed", price: 810 }, { date: "Thu", price: 805 }, { date: "Fri", price: 802 }, { date: "Sat", price: 800 }] },
  { id: 11, name: "Bottle Gourd", nameHi: "लौकी", emoji: "🍈", price: 1000, unit: "kg", change24h: -2.8, mandi: "Ahmedabad", state: "Gujarat", category: "Vegetables",
    history: [{ date: "Mon", price: 1050 }, { date: "Tue", price: 1040 }, { date: "Wed", price: 1025 }, { date: "Thu", price: 1015 }, { date: "Fri", price: 1008 }, { date: "Sat", price: 1000 }] },
  { id: 12, name: "Bitter Gourd", nameHi: "करेला", emoji: "🥒", price: 1800, unit: "kg", change24h: 4.6, mandi: "Indore", state: "Madhya Pradesh", category: "Vegetables",
    history: [{ date: "Mon", price: 1700 }, { date: "Tue", price: 1720 }, { date: "Wed", price: 1750 }, { date: "Thu", price: 1775 }, { date: "Fri", price: 1790 }, { date: "Sat", price: 1800 }] },
  // Cereals
  { id: 13, name: "Wheat", nameHi: "गेहूँ", emoji: "🌾", price: 2650, unit: "quintal", change24h: 2.1, mandi: "Delhi", state: "Delhi", category: "Cereals",
    history: [{ date: "Mon", price: 2580 }, { date: "Tue", price: 2600 }, { date: "Wed", price: 2620 }, { date: "Thu", price: 2610 }, { date: "Fri", price: 2640 }, { date: "Sat", price: 2650 }] },
  { id: 14, name: "Rice", nameHi: "चावल", emoji: "🍚", price: 4200, unit: "quintal", change24h: -1.3, mandi: "Karnal", state: "Haryana", category: "Cereals",
    history: [{ date: "Mon", price: 4300 }, { date: "Tue", price: 4280 }, { date: "Wed", price: 4250 }, { date: "Thu", price: 4230 }, { date: "Fri", price: 4210 }, { date: "Sat", price: 4200 }] },
  // Spices
  { id: 15, name: "Green Chilli", nameHi: "हरी मिर्च", emoji: "🌶️", price: 3200, unit: "kg", change24h: -6.5, mandi: "Guntur", state: "Andhra Pradesh", category: "Spices",
    history: [{ date: "Mon", price: 3500 }, { date: "Tue", price: 3450 }, { date: "Wed", price: 3400 }, { date: "Thu", price: 3350 }, { date: "Fri", price: 3280 }, { date: "Sat", price: 3200 }] },
  { id: 16, name: "Turmeric", nameHi: "हल्दी", emoji: "🟡", price: 12500, unit: "quintal", change24h: 4.1, mandi: "Erode", state: "Tamil Nadu", category: "Spices",
    history: [{ date: "Mon", price: 11900 }, { date: "Tue", price: 12000 }, { date: "Wed", price: 12100 }, { date: "Thu", price: 12200 }, { date: "Fri", price: 12350 }, { date: "Sat", price: 12500 }] },
  // Pulses
  { id: 17, name: "Chickpea", nameHi: "चना", emoji: "🫛", price: 5600, unit: "quintal", change24h: 2.5, mandi: "Indore", state: "Madhya Pradesh", category: "Pulses",
    history: [{ date: "Mon", price: 5450 }, { date: "Tue", price: 5480 }, { date: "Wed", price: 5500 }, { date: "Thu", price: 5530 }, { date: "Fri", price: 5560 }, { date: "Sat", price: 5600 }] },
  // Oilseeds
  { id: 18, name: "Soybean", nameHi: "सोयाबीन", emoji: "🫘", price: 4800, unit: "quintal", change24h: 1.4, mandi: "Indore", state: "Madhya Pradesh", category: "Oilseeds",
    history: [{ date: "Mon", price: 4700 }, { date: "Tue", price: 4720 }, { date: "Wed", price: 4740 }, { date: "Thu", price: 4760 }, { date: "Fri", price: 4780 }, { date: "Sat", price: 4800 }] },
  // More demo vegetables
  { id: 19, name: "Okra", nameHi: "भिंडी", emoji: "🫛", price: 2100, unit: "kg", change24h: 3.1, mandi: "Surat", state: "Gujarat", category: "Vegetables",
    history: [{ date: "Mon", price: 1980 }, { date: "Tue", price: 2010 }, { date: "Wed", price: 2040 }, { date: "Thu", price: 2070 }, { date: "Fri", price: 2090 }, { date: "Sat", price: 2100 }] },
  { id: 20, name: "Radish", nameHi: "मूली", emoji: "🥕", price: 900, unit: "kg", change24h: -1.8, mandi: "Agra", state: "Uttar Pradesh", category: "Vegetables",
    history: [{ date: "Mon", price: 940 }, { date: "Tue", price: 930 }, { date: "Wed", price: 925 }, { date: "Thu", price: 915 }, { date: "Fri", price: 905 }, { date: "Sat", price: 900 }] },
  { id: 21, name: "Beetroot", nameHi: "चुकंदर", emoji: "🍠", price: 1700, unit: "kg", change24h: 2.2, mandi: "Nashik", state: "Maharashtra", category: "Vegetables",
    history: [{ date: "Mon", price: 1620 }, { date: "Tue", price: 1640 }, { date: "Wed", price: 1660 }, { date: "Thu", price: 1680 }, { date: "Fri", price: 1690 }, { date: "Sat", price: 1700 }] },
  { id: 22, name: "Pumpkin", nameHi: "कद्दू", emoji: "🎃", price: 1300, unit: "kg", change24h: 1.5, mandi: "Kanpur", state: "Uttar Pradesh", category: "Vegetables",
    history: [{ date: "Mon", price: 1240 }, { date: "Tue", price: 1255 }, { date: "Wed", price: 1270 }, { date: "Thu", price: 1285 }, { date: "Fri", price: 1290 }, { date: "Sat", price: 1300 }] },
  { id: 23, name: "Ridge Gourd", nameHi: "तुरई", emoji: "🥒", price: 1500, unit: "kg", change24h: -0.9, mandi: "Patna", state: "Bihar", category: "Vegetables",
    history: [{ date: "Mon", price: 1540 }, { date: "Tue", price: 1530 }, { date: "Wed", price: 1520 }, { date: "Thu", price: 1510 }, { date: "Fri", price: 1505 }, { date: "Sat", price: 1500 }] },
  { id: 24, name: "Drumstick", nameHi: "सहजन", emoji: "🌿", price: 2600, unit: "kg", change24h: 4.7, mandi: "Madurai", state: "Tamil Nadu", category: "Vegetables",
    history: [{ date: "Mon", price: 2350 }, { date: "Tue", price: 2400 }, { date: "Wed", price: 2475 }, { date: "Thu", price: 2520 }, { date: "Fri", price: 2570 }, { date: "Sat", price: 2600 }] },
  { id: 25, name: "Coriander", nameHi: "धनिया", emoji: "🌿", price: 1100, unit: "kg", change24h: 2.9, mandi: "Bhopal", state: "Madhya Pradesh", category: "Vegetables",
    history: [{ date: "Mon", price: 1030 }, { date: "Tue", price: 1050 }, { date: "Wed", price: 1065 }, { date: "Thu", price: 1080 }, { date: "Fri", price: 1090 }, { date: "Sat", price: 1100 }] },
  { id: 26, name: "Green Peas", nameHi: "हरी मटर", emoji: "🫛", price: 2300, unit: "kg", change24h: -3.3, mandi: "Shimla", state: "Himachal Pradesh", category: "Vegetables",
    history: [{ date: "Mon", price: 2500 }, { date: "Tue", price: 2460 }, { date: "Wed", price: 2420 }, { date: "Thu", price: 2380 }, { date: "Fri", price: 2340 }, { date: "Sat", price: 2300 }] },
  { id: 27, name: "Garlic", nameHi: "लहसुन", emoji: "🧄", price: 4200, unit: "kg", change24h: 5.6, mandi: "Mandsaur", state: "Madhya Pradesh", category: "Vegetables",
    history: [{ date: "Mon", price: 3900 }, { date: "Tue", price: 3980 }, { date: "Wed", price: 4040 }, { date: "Thu", price: 4100 }, { date: "Fri", price: 4160 }, { date: "Sat", price: 4200 }] },
  { id: 28, name: "Ginger", nameHi: "अदरक", emoji: "🫚", price: 3800, unit: "kg", change24h: 3.8, mandi: "Kochi", state: "Kerala", category: "Vegetables",
    history: [{ date: "Mon", price: 3520 }, { date: "Tue", price: 3580 }, { date: "Wed", price: 3640 }, { date: "Thu", price: 3700 }, { date: "Fri", price: 3750 }, { date: "Sat", price: 3800 }] },
  { id: 29, name: "Fenugreek Leaves", nameHi: "मेथी", emoji: "🌿", price: 1250, unit: "kg", change24h: -2.4, mandi: "Nagpur", state: "Maharashtra", category: "Vegetables",
    history: [{ date: "Mon", price: 1320 }, { date: "Tue", price: 1300 }, { date: "Wed", price: 1285 }, { date: "Thu", price: 1270 }, { date: "Fri", price: 1260 }, { date: "Sat", price: 1250 }] },
  { id: 30, name: "Pointed Gourd", nameHi: "परवल", emoji: "🥒", price: 1950, unit: "kg", change24h: 1.1, mandi: "Varanasi", state: "Uttar Pradesh", category: "Vegetables",
    history: [{ date: "Mon", price: 1890 }, { date: "Tue", price: 1900 }, { date: "Wed", price: 1915 }, { date: "Thu", price: 1930 }, { date: "Fri", price: 1940 }, { date: "Sat", price: 1950 }] },
  { id: 31, name: "Turnip", nameHi: "शलजम", emoji: "🥔", price: 1150, unit: "kg", change24h: 0.7, mandi: "Dehradun", state: "Uttarakhand", category: "Vegetables",
    history: [{ date: "Mon", price: 1110 }, { date: "Tue", price: 1120 }, { date: "Wed", price: 1130 }, { date: "Thu", price: 1135 }, { date: "Fri", price: 1140 }, { date: "Sat", price: 1150 }] },
  { id: 32, name: "Sweet Corn", nameHi: "मीठा मक्का", emoji: "🌽", price: 1850, unit: "kg", change24h: 2.6, mandi: "Mysore", state: "Karnataka", category: "Vegetables",
    history: [{ date: "Mon", price: 1740 }, { date: "Tue", price: 1760 }, { date: "Wed", price: 1785 }, { date: "Thu", price: 1810 }, { date: "Fri", price: 1830 }, { date: "Sat", price: 1850 }] },
];

const categories = ["All", "Cereals", "Vegetables", "Oilseeds", "Cash Crops", "Pulses", "Spices"];

const fetchMarketPrices = async () => {
  try {
    const apiUrl = "https://api.data.gov.in/resource/9ef2731d-91f2-4fd2-a055-14f777e43997";
    const apiKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
    const fullUrl = `${apiUrl}?api-key=${apiKey}&format=json&limit=1000&offset=0`;

    // Strategy 1: AllOrigins (Most reliable recently)
    // Using api.allorigins.win with a random query param to bypass their cache
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}&_=${Date.now()}`;

    console.log(`📡 Fetching live prices via AllOrigins...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(proxyUrl, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const wrapper = await response.json();
        // AllOrigins returns the stringified response in a 'contents' field
        const data = typeof wrapper.contents === 'string' ? JSON.parse(wrapper.contents) : wrapper.contents;

        if (data && data.records && Array.isArray(data.records) && data.records.length > 0) {
          console.log(`✅ LIVE prices loaded: ${data.records.length} records`);

          return data.records
            .map((record: any) => ({
              commodity: String(record.commodity || "").trim(),
              modal_price: parseFloat(record.modal_price) || 0,
              market: String(record.market || "").trim(),
              state: String(record.state || "").trim(),
              date: record.arrival_date || new Date().toLocaleDateString(),
            }))
            .filter((r: any) => r.modal_price > 0);
        }
      }
    } catch (err) {
      console.warn("⚠️ AllOrigins fetch failed, trying direct (local) fallback...");
    }

    // Phase 2: Try direct fetch (In case user has CORS extension or is on localhost with dev server proxy)
    try {
      const directResponse = await fetch(fullUrl);
      if (directResponse.ok) {
        const data = await directResponse.json();
        if (data.records) return data.records;
      }
    } catch (e) {
      // Ignore direct fetch failure
    }

    return [];
  } catch (error) {
    console.error("❌ Market API logic error:", error);
    return [];
  }
};

export default function MarketPrices() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedCrop, setSelectedCrop] = useState<CropPrice | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price" | "change">("change");

  const { data: apiRecords, isLoading, isFetching } = useQuery({
    queryKey: ["marketPrices"],
    queryFn: fetchMarketPrices,
    refetchInterval: 300000, // Refetch every 5 minutes (300000 ms)
    staleTime: 240000, // Data is fresh for 4 minutes
    gcTime: 600000, // Cache for 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const liveCrops = useMemo(() => {
    // If API returned no data, use mock crops
    if (!apiRecords || apiRecords.length === 0) {
      console.log("📊 Using mock crop data (API unavailable)");
      return crops;
    }

    console.log("🔄 Updating prices from live API data...");

    return crops.map(c => {
      const cleanName = c.name.split("(")[0].trim().toLowerCase();
      
      // Try multiple matching strategies
      const live = apiRecords.find((r: any) => {
        const commodityLower = r.commodity.toLowerCase();
        
        // Exact word match
        if (commodityLower === cleanName) return true;
        
        // Substring match
        if (commodityLower.includes(cleanName) || cleanName.includes(commodityLower)) return true;
        
        // For multi-word crops (e.g., "green chilli" matches "chilli")
        const nameWords = cleanName.split(" ");
        const commodityWords = commodityLower.split(" ");
        if (nameWords.some(w => commodityWords.includes(w))) return true;
        
        return false;
      });
      
      if (live && live.modal_price > 0) {
        return {
          ...c,
          price: Math.round(live.modal_price), // Round to nearest integer
          mandi: live.market || c.mandi,
          state: live.state || c.state,
        };
      }
      return c;
    });
  }, [apiRecords]);

  const filtered = useMemo(() => {
    const result = liveCrops.filter((c) => {
      const searchLower = search.toLowerCase();
      const matchSearch = 
        c.name.toLowerCase().includes(searchLower) || 
        c.nameHi.includes(search) ||
        c.state.toLowerCase().includes(searchLower);
      const matchCat = category === "All" || c.category === category;
      return matchSearch && matchCat;
    });
    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return b.price - a.price;
      return Math.abs(b.change24h) - Math.abs(a.change24h);
    });
    return result;
  }, [liveCrops, search, category, sortBy]);

  // Ticker
  const tickerItems = liveCrops.filter((c) => c.change24h !== 0).map(
    (c) => `${c.emoji} ${c.name}: ₹${c.price.toLocaleString()} (${c.change24h > 0 ? "+" : ""}${c.change24h}%)`
  );

  return (
    <>
      <div className="mb-8">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h1 className="text-4xl font-heading font-bold text-black">
              🌱 Market Prices
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Real-time commodity prices from across India's mandis
            </p>
          </div>
          {!apiRecords || apiRecords.length === 0 ? (
            <span className="text-xs bg-yellow-500/10 text-yellow-700 px-3 py-1 rounded-full border border-yellow-500/20 font-medium">
              Demo Data
            </span>
          ) : (
            <span className="text-xs bg-green-500/10 text-green-700 px-3 py-1 rounded-full border border-green-500/20 font-medium">
              ✓ Live
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading market data...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Ticker */}
          {tickerItems.length > 0 && (
            <div className="glass-card rounded-2xl px-5 py-3 mb-8 overflow-hidden border border-border/50">
              <div className="flex animate-marquee whitespace-nowrap">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <span key={i} className="text-sm font-medium text-muted-foreground mx-8">{item}</span>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by crop, state, or mandi..." 
                className="pl-12 h-11 rounded-xl border-2 border-border/50 focus:border-primary transition-colors text-base" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                  category === cat
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3 mb-6 px-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sort by:</span>
            <div className="flex gap-2">
              {(["change", "price", "name"] as const).map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSortBy(s)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    sortBy === s 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted border border-border/30"
                  }`}
                >
                  {s === "change" ? "📈 Trending" : s === "price" ? "💰 Price" : "🔤 Name"}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Grid of Price Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {filtered.map((crop, i) => (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => setSelectedCrop(crop)}
                className={`group relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 overflow-hidden
                  ${selectedCrop?.id === crop.id 
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/20" 
                    : "border-border/30 bg-card/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                  }`}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  {/* Emoji and Category Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{crop.emoji}</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {crop.category}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-heading font-bold text-foreground mb-1 text-lg line-clamp-1">
                    {crop.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{crop.mandi}, {crop.state}</span>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-end gap-2 mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Price</p>
                      <p className="font-numbers font-bold text-2xl text-foreground">₹{crop.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">{crop.unit}</p>
                    </div>
                  </div>

                  {/* Change indicator */}
                  <div className={`flex items-center gap-1.5 font-numbers font-semibold text-sm py-2 px-3 rounded-lg ${
                    crop.change24h > 0 
                      ? "bg-green-500/10 text-green-700" 
                      : crop.change24h < 0 
                      ? "bg-red-500/10 text-red-700"
                      : "bg-gray-500/10 text-gray-700"
                  }`}>
                    {crop.change24h > 0 ? <TrendingUp className="w-4 h-4" /> : crop.change24h < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                    <span>{crop.change24h > 0 ? "+" : ""}{crop.change24h}% (24h)</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">No crops found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          )}
        </>
      )}
    </>
  );
}