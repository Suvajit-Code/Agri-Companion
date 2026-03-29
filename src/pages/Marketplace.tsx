import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Star, Plus, Minus, X, Filter,
  Package, Leaf, Bug, Droplets, Wrench, Scissors, ChevronRight, CreditCard,
  MapPin, TrendingDown, Heart, Truck, Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PaymentDialog from "@/components/PaymentDialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  inStock: boolean;
  badge?: string;
  location: string;
  state: string;
  deliveryDays: string;
  discount?: number;
}

interface CartItem extends Product {
  qty: number;
}

const categoryIcons: Record<string, React.ElementType> = {
  Seeds: Leaf,
  Fertilizers: Package,
  Pesticides: Bug,
  Irrigation: Droplets,
  Equipment: Wrench,
  Tools: Scissors,
};

const products: Product[] = [
  // Seeds - Different States
  { id: 1, name: "Hybrid Wheat Seeds (HD-3226)", brand: "IARI", price: 850, originalPrice: 1000, rating: 4.7, reviews: 342, image: "🌾", category: "Seeds", inStock: true, badge: "Best Seller", location: "New Delhi", state: "Delhi", deliveryDays: "2-3", discount: 15 },
  { id: 2, name: "Basmati Rice Seeds (Pusa-1509)", brand: "IARI", price: 1200, rating: 4.5, reviews: 218, image: "🍚", category: "Seeds", inStock: true, location: "Karnal", state: "Haryana", deliveryDays: "3-4" },
  { id: 3, name: "Tomato Seeds (Arka Rakshak)", brand: "IIHR", price: 320, rating: 4.8, reviews: 567, image: "🍅", category: "Seeds", inStock: true, badge: "Popular", location: "Bangalore", state: "Karnataka", deliveryDays: "2-3" },
  { id: 4, name: "Mustard Seeds (Pusa Bold)", brand: "IARI", price: 480, rating: 4.3, reviews: 189, image: "🌻", category: "Seeds", inStock: true, location: "Jaipur", state: "Rajasthan", deliveryDays: "3-4" },
  { id: 5, name: "Onion Seeds (Agrifound Dark Red)", brand: "NHRDF", price: 650, rating: 4.6, reviews: 134, image: "🧅", category: "Seeds", inStock: false, location: "Nashik", state: "Maharashtra", deliveryDays: "2-3" },
  { id: 6, name: "Cotton Seeds (Bt Hybrid)", brand: "Mahyco", price: 920, originalPrice: 1100, rating: 4.4, reviews: 445, image: "☁️", category: "Seeds", inStock: true, location: "Akola", state: "Maharashtra", deliveryDays: "3-4", discount: 16 },
  { id: 7, name: "Soybean Seeds (JS-335)", brand: "JNKVV", price: 380, rating: 4.5, reviews: 289, image: "🫘", category: "Seeds", inStock: true, location: "Indore", state: "Madhya Pradesh", deliveryDays: "2-3" },
  { id: 8, name: "Groundnut Seeds (TG-37A)", brand: "Junagadh", price: 520, rating: 4.6, reviews: 178, image: "🥜", category: "Seeds", inStock: true, location: "Junagadh", state: "Gujarat", deliveryDays: "3-4" },
  { id: 9, name: "Maize Seeds (Bio-9681)", brand: "Bioseed", price: 450, rating: 4.7, reviews: 312, image: "🌽", category: "Seeds", inStock: true, badge: "New", location: "Hyderabad", state: "Telangana", deliveryDays: "2-3" },
  { id: 10, name: "Chilli Seeds (Teja)", brand: "IIHR", price: 280, rating: 4.4, reviews: 156, image: "🌶️", category: "Seeds", inStock: true, location: "Guntur", state: "Andhra Pradesh", deliveryDays: "3-4" },

  // Fertilizers - Different States
  { id: 11, name: "DAP Fertilizer (50kg)", brand: "IFFCO", price: 1350, rating: 4.4, reviews: 890, image: "📦", category: "Fertilizers", inStock: true, badge: "Top Rated", location: "Phulpur", state: "Uttar Pradesh", deliveryDays: "4-5" },
  { id: 12, name: "Urea (45kg)", brand: "NFL", price: 266, rating: 4.2, reviews: 1200, image: "🧪", category: "Fertilizers", inStock: true, location: "Panipat", state: "Haryana", deliveryDays: "3-4" },
  { id: 13, name: "NPK 20:20:0 (50kg)", brand: "IFFCO", price: 1050, rating: 4.5, reviews: 456, image: "⚗️", category: "Fertilizers", inStock: true, location: "Kalol", state: "Gujarat", deliveryDays: "3-4" },
  { id: 14, name: "Vermicompost Organic (25kg)", brand: "GreenGold", price: 480, originalPrice: 550, rating: 4.9, reviews: 678, image: "🌿", category: "Fertilizers", inStock: true, badge: "Organic", location: "Coimbatore", state: "Tamil Nadu", deliveryDays: "4-5", discount: 13 },
  { id: 15, name: "Potash MOP (50kg)", brand: "RCF", price: 850, rating: 4.3, reviews: 345, image: "💎", category: "Fertilizers", inStock: true, location: "Mumbai", state: "Maharashtra", deliveryDays: "2-3" },
  { id: 16, name: "SSP Fertilizer (50kg)", brand: "GSFC", price: 420, rating: 4.1, reviews: 234, image: "🔵", category: "Fertilizers", inStock: true, location: "Vadodara", state: "Gujarat", deliveryDays: "3-4" },
  { id: 17, name: "Zinc Sulphate (10kg)", brand: "Zuari", price: 380, rating: 4.6, reviews: 189, image: "⚡", category: "Fertilizers", inStock: true, location: "Goa", state: "Goa", deliveryDays: "3-4" },
  { id: 18, name: "Neem Coated Urea (45kg)", brand: "KRIBHCO", price: 290, rating: 4.7, reviews: 567, image: "🍃", category: "Fertilizers", inStock: true, badge: "Eco", location: "Hazira", state: "Gujarat", deliveryDays: "3-4" },

  // Pesticides - Different States
  { id: 19, name: "Neem Oil (1L)", brand: "AgroNeem", price: 320, rating: 4.6, reviews: 345, image: "🍃", category: "Pesticides", inStock: true, location: "Bengaluru", state: "Karnataka", deliveryDays: "2-3" },
  { id: 20, name: "Chlorpyrifos 20% EC (1L)", brand: "Tata Rallis", price: 420, rating: 4.1, reviews: 234, image: "🔬", category: "Pesticides", inStock: true, location: "Mumbai", state: "Maharashtra", deliveryDays: "2-3" },
  { id: 21, name: "Fungicide Mancozeb (500g)", brand: "UPL", price: 280, rating: 4.3, reviews: 178, image: "🧫", category: "Pesticides", inStock: true, location: "Ahmedabad", state: "Gujarat", deliveryDays: "3-4" },
  { id: 22, name: "Imidacloprid 17.8% SL (100ml)", brand: "Bayer", price: 180, rating: 4.5, reviews: 456, image: "💧", category: "Pesticides", inStock: true, location: "Thane", state: "Maharashtra", deliveryDays: "2-3" },
  { id: 23, name: "Tricyclazole 75% WP (100g)", brand: "BASF", price: 220, rating: 4.4, reviews: 289, image: "🎯", category: "Pesticides", inStock: true, location: "Chennai", state: "Tamil Nadu", deliveryDays: "3-4" },
  { id: 24, name: "Glyphosate 41% SL (1L)", brand: "Monsanto", price: 350, rating: 4.2, reviews: 178, image: "☠️", category: "Pesticides", inStock: true, location: "Kolkata", state: "West Bengal", deliveryDays: "4-5" },
  { id: 25, name: "Spinosad 45% SC (100ml)", brand: "Dow", price: 280, rating: 4.7, reviews: 234, image: "🦋", category: "Pesticides", inStock: true, badge: "New", location: "Pune", state: "Maharashtra", deliveryDays: "2-3" },

  // Irrigation - Different States
  { id: 26, name: "Drip Irrigation Kit (1 acre)", brand: "Jain Irrigation", price: 12500, originalPrice: 15000, rating: 4.7, reviews: 89, image: "💧", category: "Irrigation", inStock: true, location: "Jalgaon", state: "Maharashtra", deliveryDays: "5-7", discount: 17 },
  { id: 27, name: "Sprinkler Set (Quarter acre)", brand: "Netafim", price: 4500, rating: 4.4, reviews: 67, image: "🌧️", category: "Irrigation", inStock: true, location: "Pune", state: "Maharashtra", deliveryDays: "4-5" },
  { id: 28, name: "Rain Gun (High Pressure)", brand: "Finolex", price: 3200, rating: 4.3, reviews: 123, image: "🔫", category: "Irrigation", inStock: true, location: "Pune", state: "Maharashtra", deliveryDays: "3-4" },
  { id: 29, name: "PVC Pipes (110mm, 6m)", brand: "Supreme", price: 450, rating: 4.5, reviews: 567, image: "🔵", category: "Irrigation", inStock: true, location: "Mumbai", state: "Maharashtra", deliveryDays: "2-3" },
  { id: 30, name: "Micro Sprinkler Kit", brand: "NaanDanJain", price: 2800, rating: 4.6, reviews: 89, image: "💦", category: "Irrigation", inStock: true, location: "Bangalore", state: "Karnataka", deliveryDays: "3-4" },

  // Equipment - Different States
  { id: 31, name: "Water Pump 1HP", brand: "Kirloskar", price: 8500, rating: 4.6, reviews: 234, image: "⚡", category: "Equipment", inStock: true, location: "Pune", state: "Maharashtra", deliveryDays: "3-4" },
  { id: 32, name: "Manual Seed Drill", brand: "KSNM", price: 3200, rating: 4.2, reviews: 56, image: "🔧", category: "Equipment", inStock: true, location: "Coimbatore", state: "Tamil Nadu", deliveryDays: "5-7" },
  { id: 33, name: "Solar Panel Kit (100W)", brand: "Loom Solar", price: 6800, originalPrice: 7500, rating: 4.8, reviews: 123, image: "☀️", category: "Equipment", inStock: true, badge: "Eco", location: "Noida", state: "Uttar Pradesh", deliveryDays: "4-5", discount: 9 },
  { id: 34, name: "Power Weeder (5HP)", brand: "VST", price: 25000, rating: 4.5, reviews: 78, image: "🚜", category: "Equipment", inStock: true, location: "Hosur", state: "Tamil Nadu", deliveryDays: "7-10" },
  { id: 35, name: "Brush Cutter (2 Stroke)", brand: "Honda", price: 12000, rating: 4.7, reviews: 145, image: "✂️", category: "Equipment", inStock: true, location: "Greater Noida", state: "Uttar Pradesh", deliveryDays: "4-5" },
  { id: 36, name: "Sprayer (16L Battery)", brand: "Aspee", price: 2800, rating: 4.4, reviews: 234, image: "🎒", category: "Equipment", inStock: true, location: "Mumbai", state: "Maharashtra", deliveryDays: "2-3" },

  // Tools - Different States
  { id: 37, name: "Pruning Shears (Professional)", brand: "Falcon", price: 450, rating: 4.5, reviews: 312, image: "✂️", category: "Tools", inStock: true, location: "Jalandhar", state: "Punjab", deliveryDays: "3-4" },
  { id: 38, name: "Garden Hoe (Heavy Duty)", brand: "Falcon", price: 380, rating: 4.3, reviews: 201, image: "🪓", category: "Tools", inStock: true, location: "Ludhiana", state: "Punjab", deliveryDays: "3-4" },
  { id: 39, name: "Soil Testing Kit", brand: "Himedia", price: 2400, rating: 4.7, reviews: 89, image: "🧪", category: "Tools", inStock: true, badge: "New", location: "Mumbai", state: "Maharashtra", deliveryDays: "2-3" },
  { id: 40, name: "Khurpi (Traditional)", brand: "Local", price: 120, rating: 4.1, reviews: 456, image: "🔪", category: "Tools", inStock: true, location: "Moradabad", state: "Uttar Pradesh", deliveryDays: "3-4" },
  { id: 41, name: "Sickle (Stainless Steel)", brand: "Tata", price: 180, rating: 4.4, reviews: 345, image: "🌙", category: "Tools", inStock: true, location: "Jamshedpur", state: "Jharkhand", deliveryDays: "4-5" },
  { id: 42, name: "Wheelbarrow (Heavy Duty)", brand: "Bharat", price: 1800, rating: 4.2, reviews: 123, image: "🛒", category: "Tools", inStock: true, location: "Raipur", state: "Chhattisgarh", deliveryDays: "5-7" },
  { id: 43, name: "Spade (Gardening)", brand: "Falcon", price: 250, rating: 4.3, reviews: 234, image: "⛏️", category: "Tools", inStock: true, location: "Dehradun", state: "Uttarakhand", deliveryDays: "4-5" },
  { id: 44, name: "Rake (Leaf)", brand: "Garden Tech", price: 320, rating: 4.5, reviews: 178, image: "🧹", category: "Tools", inStock: true, location: "Shimla", state: "Himachal Pradesh", deliveryDays: "5-7" },
  { id: 45, name: "Watering Can (10L)", brand: "Natraj", price: 280, rating: 4.6, reviews: 289, image: "🚿", category: "Tools", inStock: true, location: "Indore", state: "Madhya Pradesh", deliveryDays: "3-4" },
];

const categories = ["All", "Seeds", "Fertilizers", "Pesticides", "Irrigation", "Equipment", "Tools"];

const states = [
  "All States", "Andhra Pradesh", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export default function Marketplace() {
  const { toast } = useToast();
  const { user } = useAuth();
  const sb = supabase as any;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stateFilter, setStateFilter] = useState("All States");
  const [sortBy, setSortBy] = useState("popular");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || p.category === category;
      const matchState = stateFilter === "All States" || p.state === stateFilter;
      return matchSearch && matchCat && matchState;
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "reviews") result.sort((a, b) => b.reviews - a.reviews);

    return result;
  }, [search, category, stateFilter, sortBy]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing)
        return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...product, qty: 1 }];
    });
    toast({ title: "Added to cart", description: `${product.name} added` });
  };

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    toast({
      title: wishlist.includes(id) ? "Removed from wishlist" : "Added to wishlist",
      description: wishlist.includes(id) ? "Item removed" : "Item saved for later",
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const handleCheckoutSuccess = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderData = {
        user_id: user.id,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
        total_price: cartTotal + (cartTotal >= 999 ? 0 : 49),
        status: "pending",
        payment_status: "paid",
        shipping_address: "Default Delivery Address",
      };

      const localKey = `local_orders_${user.id}`;
      const localOrders = JSON.parse(localStorage.getItem(localKey) || "[]");
      const newLocalOrder = {
        ...orderData,
        id: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(localKey, JSON.stringify([newLocalOrder, ...localOrders]));

      await sb.from("marketplace_orders").insert([orderData]);

      toast({
        title: "Order Placed!",
        description: "Your order details are now visible in the Orders section.",
      });
      setCart([]);
      setShowCart(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Error",
        description: "Failed to process order: " + message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-heading font-bold text-foreground"
          >
            🛒 Agricultural Marketplace
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Premium seeds, fertilizers, equipment & more from verified sellers across India
          </p>
        </div>
        <Button variant="outline" className="relative" onClick={() => setShowCart(!showCart)}>
          <ShoppingCart className="w-4 h-4 mr-2" /> Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Package, value: "5000+", label: "Products", color: "text-primary" },
          { icon: MapPin, value: "28+", label: "States Covered", color: "text-success" },
          { icon: Truck, value: "Free", label: "Delivery > ₹999", color: "text-warning" },
          { icon: Shield, value: "100%", label: "Genuine Products", color: "text-info" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card rounded-xl p-4 text-center hover:shadow-[var(--shadow-hover)] transition-all"
          >
            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <div className="font-mono font-bold text-xl text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Package;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0 transition-all ${
                  category === cat
                    ? "gradient-hero text-primary-foreground shadow-md"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat !== "All" && <Icon className="w-4 h-4" />}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products, brands, locations..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <MapPin className="w-4 h-4 mr-2" />
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> products
          {stateFilter !== "All States" && (
            <span>
              {" "}
              in <span className="font-semibold text-foreground">{stateFilter}</span>
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Product Grid */}
        <div
          className={`flex-1 grid grid-cols-1 sm:grid-cols-2 ${
            showCart ? "lg:grid-cols-2" : "lg:grid-cols-3"
          } gap-4`}
        >
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card-hover rounded-xl overflow-hidden flex flex-col group"
            >
              {/* Image Section */}
              <div className="relative bg-gradient-to-br from-muted/50 to-muted p-6 flex items-center justify-center">
                {product.badge && (
                  <span className="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full gradient-warm text-secondary-foreground font-semibold">
                    {product.badge}
                  </span>
                )}
                {product.discount && (
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-success text-success-foreground font-semibold flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" /> {product.discount}%
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      wishlist.includes(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
                <span className="text-6xl">{product.image}</span>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  {product.location}, {product.state}
                </div>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <h3 className="font-heading font-semibold text-sm text-foreground mt-0.5 line-clamp-2 flex-1">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="text-xs font-numbers text-foreground">{product.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Truck className="w-3 h-3" />
                  <span>Delivery in {product.deliveryDays} days</span>
                </div>

                <div className="flex items-end justify-between mt-3 pt-3 border-t border-border">
                  <div>
                    <span className="font-numbers font-bold text-lg text-foreground">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through ml-1">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    disabled={!product.inStock}
                    onClick={() => addToCart(product)}
                    className="gradient-hero text-primary-foreground border-0 hover:opacity-90"
                  >
                    {product.inStock ? (
                      <>
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </>
                    ) : (
                      "Out of Stock"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 shrink-0 hidden lg:block"
            >
              <div className="glass-card rounded-2xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-foreground">
                    Cart ({cartCount})
                  </h3>
                  <button onClick={() => setShowCart(false)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Cart is empty</p>
                    <p className="text-xs text-muted-foreground mt-1">Add items to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                        >
                          <span className="text-2xl">{item.image}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground font-numbers">
                              ₹{item.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-muted/80"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-numbers w-6 text-center">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-muted/80"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border mt-4 pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-numbers text-foreground">
                          ₹{cartTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="font-numbers text-success">
                          {cartTotal >= 999 ? "Free" : "₹49"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-foreground">Total</span>
                        <span className="font-numbers font-bold text-foreground">
                          ₹{(cartTotal + (cartTotal >= 999 ? 0 : 49)).toLocaleString()}
                        </span>
                      </div>
                      <Button
                        className="w-full gradient-warm text-secondary-foreground border-0 hover:opacity-90"
                        onClick={() => setPaymentOpen(true)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" /> Checkout{" "}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No products found matching your criteria</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setStateFilter("All States");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={cartTotal + (cartTotal >= 999 ? 0 : 49)}
        description={`Marketplace order — ${cartCount} items`}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}