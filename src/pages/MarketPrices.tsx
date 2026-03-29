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
  { id: 1, name: "Wheat", nameHi: "गेहूँ", emoji: "🌾", price: 2650, unit: "quintal", change24h: 2.1, mandi: "Azadpur", state: "Delhi", category: "Cereals",
    history: [{ date: "Mon", price: 2580 }, { date: "Tue", price: 2600 }, { date: "Wed", price: 2620 }, { date: "Thu", price: 2610 }, { date: "Fri", price: 2640 }, { date: "Sat", price: 2650 }] },
  { id: 2, name: "Rice (Basmati)", nameHi: "चावल", emoji: "🍚", price: 4200, unit: "quintal", change24h: -1.3, mandi: "Karnal", state: "Haryana", category: "Cereals",
    history: [{ date: "Mon", price: 4300 }, { date: "Tue", price: 4280 }, { date: "Wed", price: 4250 }, { date: "Thu", price: 4230 }, { date: "Fri", price: 4210 }, { date: "Sat", price: 4200 }] },
  { id: 3, name: "Tomato", nameHi: "टमाटर", emoji: "🍅", price: 2800, unit: "quintal", change24h: 12.5, mandi: "Azadpur", state: "Delhi", category: "Vegetables",
    history: [{ date: "Mon", price: 2200 }, { date: "Tue", price: 2350 }, { date: "Wed", price: 2500 }, { date: "Thu", price: 2600 }, { date: "Fri", price: 2700 }, { date: "Sat", price: 2800 }] },
  { id: 4, name: "Potato", nameHi: "आलू", emoji: "🥔", price: 1800, unit: "quintal", change24h: -3.2, mandi: "Kolkata", state: "West Bengal", category: "Vegetables",
    history: [{ date: "Mon", price: 1900 }, { date: "Tue", price: 1880 }, { date: "Wed", price: 1860 }, { date: "Thu", price: 1840 }, { date: "Fri", price: 1820 }, { date: "Sat", price: 1800 }] },
  { id: 5, name: "Onion", nameHi: "प्याज़", emoji: "🧅", price: 2400, unit: "quintal", change24h: 5.8, mandi: "Lasalgaon", state: "Maharashtra", category: "Vegetables",
    history: [{ date: "Mon", price: 2200 }, { date: "Tue", price: 2250 }, { date: "Wed", price: 2300 }, { date: "Thu", price: 2320 }, { date: "Fri", price: 2370 }, { date: "Sat", price: 2400 }] },
  { id: 6, name: "Soybean", nameHi: "सोयाबीन", emoji: "🫘", price: 4800, unit: "quintal", change24h: 1.4, mandi: "Indore", state: "Madhya Pradesh", category: "Oilseeds",
    history: [{ date: "Mon", price: 4700 }, { date: "Tue", price: 4720 }, { date: "Wed", price: 4740 }, { date: "Thu", price: 4760 }, { date: "Fri", price: 4780 }, { date: "Sat", price: 4800 }] },
  { id: 7, name: "Mustard", nameHi: "सरसों", emoji: "🌻", price: 5400, unit: "quintal", change24h: -0.8, mandi: "Jaipur", state: "Rajasthan", category: "Oilseeds",
    history: [{ date: "Mon", price: 5450 }, { date: "Tue", price: 5430 }, { date: "Wed", price: 5420 }, { date: "Thu", price: 5410 }, { date: "Fri", price: 5405 }, { date: "Sat", price: 5400 }] },
  { id: 8, name: "Cotton", nameHi: "कपास", emoji: "☁️", price: 6800, unit: "quintal", change24h: 3.2, mandi: "Rajkot", state: "Gujarat", category: "Cash Crops",
    history: [{ date: "Mon", price: 6550 }, { date: "Tue", price: 6600 }, { date: "Wed", price: 6650 }, { date: "Thu", price: 6700 }, { date: "Fri", price: 6750 }, { date: "Sat", price: 6800 }] },
  { id: 9, name: "Sugarcane", nameHi: "गन्ना", emoji: "🎋", price: 350, unit: "quintal", change24h: 0.0, mandi: "Lucknow", state: "Uttar Pradesh", category: "Cash Crops",
    history: [{ date: "Mon", price: 350 }, { date: "Tue", price: 350 }, { date: "Wed", price: 350 }, { date: "Thu", price: 350 }, { date: "Fri", price: 350 }, { date: "Sat", price: 350 }] },
  { id: 10, name: "Chickpea", nameHi: "चना", emoji: "🫛", price: 5600, unit: "quintal", change24h: 2.5, mandi: "Indore", state: "Madhya Pradesh", category: "Pulses",
    history: [{ date: "Mon", price: 5450 }, { date: "Tue", price: 5480 }, { date: "Wed", price: 5500 }, { date: "Thu", price: 5530 }, { date: "Fri", price: 5560 }, { date: "Sat", price: 5600 }] },
  { id: 11, name: "Turmeric", nameHi: "हल्दी", emoji: "🟡", price: 12500, unit: "quintal", change24h: 4.1, mandi: "Erode", state: "Tamil Nadu", category: "Spices",
    history: [{ date: "Mon", price: 11900 }, { date: "Tue", price: 12000 }, { date: "Wed", price: 12100 }, { date: "Thu", price: 12200 }, { date: "Fri", price: 12350 }, { date: "Sat", price: 12500 }] },
  { id: 12, name: "Green Chilli", nameHi: "हरी मिर्च", emoji: "🌶️", price: 3200, unit: "quintal", change24h: -6.5, mandi: "Guntur", state: "Andhra Pradesh", category: "Spices",
    history: [{ date: "Mon", price: 3500 }, { date: "Tue", price: 3450 }, { date: "Wed", price: 3400 }, { date: "Thu", price: 3350 }, { date: "Fri", price: 3280 }, { date: "Sat", price: 3200 }] },
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">📊 Market Prices</h1>
          {!apiRecords || apiRecords.length === 0 ? (
            <span className="text-xs bg-yellow-500/10 text-yellow-700 px-2 py-1 rounded-full border border-yellow-500/20">
              Demo Prices
            </span>
          ) : (
            <span className="text-xs bg-green-500/10 text-green-700 px-2 py-1 rounded-full border border-green-500/20">
              Live Data
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {!apiRecords || apiRecords.length === 0 
            ? "Demo prices - Real-time API data will appear here"
            : "Live mandi prices across India"}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-primary mb-4 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading live prices from Mandi APIs...
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="flex items-center gap-2 text-xs text-success mb-4 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          Updating live prices...
        </div>
      )}

      {/* Ticker */}
      <div className="glass-card rounded-xl px-4 py-2 mb-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-xs font-numbers text-muted-foreground mx-6">{item}</span>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by crop or state..." 
            className="pl-10" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className="shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Price Cards */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sort by:</span>
            {(["change", "price", "name"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`text-xs px-2 py-1 rounded-md ${sortBy === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {s === "change" ? "Trending" : s === "price" ? "Price" : "Name"}
              </button>
            ))}
          </div>

          {filtered.map((crop, i) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedCrop(crop)}
              className={`glass-card-hover rounded-xl p-4 cursor-pointer border-2 transition-colors ${
                selectedCrop?.id === crop.id ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{crop.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-foreground">{crop.name}</h3>
                    <span className="text-xs text-muted-foreground">{crop.nameHi}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" /> {crop.mandi}, {crop.state}
                  </div>
                </div>
                {/* Mini spark chart */}
                <div className="w-20 h-8 hidden sm:block">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={crop.history}>
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={crop.change24h >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-right">
                  <p className="font-numbers font-bold text-foreground">₹{crop.price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">/{crop.unit}</p>
                </div>
                <div className={`flex items-center gap-0.5 text-sm font-numbers font-medium ${crop.change24h > 0 ? "text-success" : crop.change24h < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {crop.change24h > 0 ? <ArrowUpRight className="w-4 h-4" /> : crop.change24h < 0 ? <ArrowDownRight className="w-4 h-4" /> : null}
                  {crop.change24h > 0 ? "+" : ""}{crop.change24h}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedCrop ? (
            <motion.div
              key={selectedCrop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedCrop.emoji}</span>
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">{selectedCrop.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedCrop.mandi}, {selectedCrop.state}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <div className="flex items-end gap-2">
                  <span className="font-numbers text-3xl font-bold text-foreground">₹{selectedCrop.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground pb-1">/{selectedCrop.unit}</span>
                </div>
                <span className={`text-sm font-numbers font-medium ${selectedCrop.change24h > 0 ? "text-success" : selectedCrop.change24h < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {selectedCrop.change24h > 0 ? "+" : ""}{selectedCrop.change24h}% (24h)
                </span>
              </div>

              {/* Chart */}
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedCrop.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={["dataMin - 50", "dataMax + 50"]} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number) => [`₹${value}`, "Price"]}
                    />
                    <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="text-foreground">{selectedCrop.category}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">MSP Status</span><span className="text-success">Available</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Trading Volume</span><span className="text-foreground font-numbers">12,450 qtl</span></div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center">
              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a crop to view detailed price analysis</p>
            </div>
          )}

          {/* Top Gainers/Losers */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-heading font-semibold text-foreground mb-3">Top Movers (24h)</h3>
            <div className="space-y-2">
              {[...crops].sort((a, b) => b.change24h - a.change24h).slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">{c.emoji} {c.name}</span>
                  <span className="text-success font-numbers">+{c.change24h}%</span>
                </div>
              ))}
              <div className="border-t border-border my-2" />
              {[...crops].sort((a, b) => a.change24h - b.change24h).slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">{c.emoji} {c.name}</span>
                  <span className="text-destructive font-numbers">{c.change24h}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}