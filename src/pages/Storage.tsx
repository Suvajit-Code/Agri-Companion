import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Warehouse, Snowflake, ThermometerSun, MapPin, Star, IndianRupee,
  Search, Filter, Calendar, Phone, User, Package, ArrowRight,
  CheckCircle2, Clock, ShieldCheck, Truck, CreditCard,
  ChevronDown, SlidersHorizontal, Grid3X3, List, Zap,
  Wind, Layers, Building2, Leaf, BarChart3, Badge as BadgeIcon,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import PaymentDialog from "@/components/PaymentDialog";

type FacilityType = "cold" | "warehouse" | "silo" | "ca" | "frozen";

interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location: string;
  state: string;
  distance: string;
  rating: number;
  reviews: number;
  pricePerQuintal: number;
  capacity: string;
  available: string;
  temperature?: string;
  features: string[];
  image: string;
  verified: boolean;
  tag?: string;
}

const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
  "https://images.unsplash.com/photo-1595246135406-803418233494?w=600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80",
  "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&q=80",
  "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=600&q=80",
  "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80",
  "https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=80",
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80",
  "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
  "https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=600&q=80",
];

const img = (i: number) => UNSPLASH_IMAGES[i % UNSPLASH_IMAGES.length];

const facilities: Facility[] = [
  // Maharashtra
  { id: "1", name: "Agri Cool Storage", type: "cold", location: "Nashik", state: "Maharashtra", distance: "12 km", rating: 4.7, reviews: 128, pricePerQuintal: 45, capacity: "5,000 MT", available: "1,200 MT", temperature: "2°C – 8°C", features: ["24/7 Monitoring", "Insurance", "Loading Dock", "CCTV"], image: img(0), verified: true, tag: "Popular" },
  { id: "2", name: "Kisan Warehouse Hub", type: "warehouse", location: "Pune", state: "Maharashtra", distance: "8 km", rating: 4.5, reviews: 95, pricePerQuintal: 25, capacity: "10,000 MT", available: "3,500 MT", features: ["Fumigation", "Weighbridge", "Security", "Transport"], image: img(1), verified: true },
  { id: "3", name: "FreshKeep Cold Chain", type: "cold", location: "Nagpur", state: "Maharashtra", distance: "5 km", rating: 4.9, reviews: 210, pricePerQuintal: 55, capacity: "3,000 MT", available: "800 MT", temperature: "0°C – 4°C", features: ["Multi-Temp Zones", "Humidity Control", "Insurance", "24/7 Monitoring"], image: img(2), verified: true, tag: "Top Rated" },
  { id: "4", name: "GrainSafe Silos", type: "silo", location: "Indore", state: "MP", distance: "18 km", rating: 4.3, reviews: 67, pricePerQuintal: 20, capacity: "8,000 MT", available: "4,000 MT", features: ["Aeration System", "Pest Control", "Weighbridge", "Rail Connected"], image: img(3), verified: false },
  { id: "5", name: "Harvest Store Premium", type: "warehouse", location: "Kolhapur", state: "Maharashtra", distance: "3 km", rating: 4.6, reviews: 145, pricePerQuintal: 30, capacity: "6,000 MT", available: "2,100 MT", features: ["Fumigation", "Insurance", "CCTV", "Loading Dock"], image: img(4), verified: true },
  { id: "6", name: "Arctic Fresh Storage", type: "cold", location: "Aurangabad", state: "Maharashtra", distance: "10 km", rating: 4.4, reviews: 78, pricePerQuintal: 50, capacity: "2,500 MT", available: "600 MT", temperature: "-5°C – 5°C", features: ["Blast Freezing", "Multi-Temp Zones", "Insurance", "Transport"], image: img(5), verified: true },
  { id: "7", name: "CoolMart Agri Store", type: "ca", location: "Sangli", state: "Maharashtra", distance: "6 km", rating: 4.8, reviews: 162, pricePerQuintal: 60, capacity: "2,000 MT", available: "500 MT", temperature: "1°C – 5°C", features: ["CA Technology", "O2 Control", "Ethylene Scrubber", "CCTV"], image: img(6), verified: true, tag: "CA Store" },
  { id: "8", name: "Bharat Grain Center", type: "silo", location: "Solapur", state: "Maharashtra", distance: "22 km", rating: 4.1, reviews: 43, pricePerQuintal: 18, capacity: "12,000 MT", available: "6,500 MT", features: ["Aeration", "Pest Control", "Weighbridge"], image: img(7), verified: false },
  { id: "9", name: "VegFresh Cold Hub", type: "cold", location: "Jalgaon", state: "Maharashtra", distance: "9 km", rating: 4.6, reviews: 89, pricePerQuintal: 48, capacity: "3,500 MT", available: "1,100 MT", temperature: "2°C – 10°C", features: ["24/7 Monitoring", "Loading Dock", "Humidity Control"], image: img(8), verified: true },
  { id: "10", name: "AgroVault Warehouse", type: "warehouse", location: "Ahmednagar", state: "Maharashtra", distance: "14 km", rating: 4.2, reviews: 51, pricePerQuintal: 22, capacity: "7,500 MT", available: "3,000 MT", features: ["Security", "Fumigation", "Transport"], image: img(9), verified: true },

  // Gujarat
  { id: "11", name: "Saurashtra Cold Store", type: "cold", location: "Rajkot", state: "Gujarat", distance: "7 km", rating: 4.5, reviews: 110, pricePerQuintal: 42, capacity: "4,000 MT", available: "900 MT", temperature: "0°C – 6°C", features: ["24/7 Monitoring", "CCTV", "Loading Dock", "Insurance"], image: img(10), verified: true },
  { id: "12", name: "Gujarat Agri Silo", type: "silo", location: "Ahmedabad", state: "Gujarat", distance: "11 km", rating: 4.4, reviews: 88, pricePerQuintal: 19, capacity: "15,000 MT", available: "7,000 MT", features: ["Aeration System", "Rail Connected", "Weighbridge", "Pest Control"], image: img(11), verified: true, tag: "Large Capacity" },
  { id: "13", name: "Kutch Frozen Foods", type: "frozen", location: "Bhuj", state: "Gujarat", distance: "15 km", rating: 4.3, reviews: 55, pricePerQuintal: 75, capacity: "1,500 MT", available: "400 MT", temperature: "-18°C – -22°C", features: ["Blast Freezing", "IQF Line", "HACCP Certified", "Cold Chain"], image: img(12), verified: true },
  { id: "14", name: "Vadodara Warehouse Co.", type: "warehouse", location: "Vadodara", state: "Gujarat", distance: "4 km", rating: 4.6, reviews: 134, pricePerQuintal: 27, capacity: "9,000 MT", available: "4,200 MT", features: ["Fumigation", "Security Guard", "CCTV", "Weighbridge"], image: img(13), verified: true },
  { id: "15", name: "Diamond Agri Cold", type: "ca", location: "Anand", state: "Gujarat", distance: "8 km", rating: 4.9, reviews: 198, pricePerQuintal: 65, capacity: "2,000 MT", available: "350 MT", temperature: "2°C – 6°C", features: ["CA Store", "O2 Monitor", "Ethylene Control", "Insurance"], image: img(14), verified: true, tag: "Best CA" },

  // Punjab & Haryana
  { id: "16", name: "Punjab Grain Hub", type: "silo", location: "Ludhiana", state: "Punjab", distance: "13 km", rating: 4.5, reviews: 176, pricePerQuintal: 17, capacity: "20,000 MT", available: "8,000 MT", features: ["Rail Connected", "Aeration", "Weighbridge", "24/7 Security"], image: img(15), verified: true, tag: "Largest" },
  { id: "17", name: "Haryana Kisan Store", type: "warehouse", location: "Hisar", state: "Haryana", distance: "6 km", rating: 4.3, reviews: 62, pricePerQuintal: 21, capacity: "8,000 MT", available: "3,500 MT", features: ["Fumigation", "Pest Control", "Security"], image: img(0), verified: true },
  { id: "18", name: "Amritsar Cold Stores", type: "cold", location: "Amritsar", state: "Punjab", distance: "9 km", rating: 4.7, reviews: 142, pricePerQuintal: 44, capacity: "3,500 MT", available: "700 MT", temperature: "2°C – 8°C", features: ["24/7 Monitoring", "CCTV", "Loading Dock", "Transport"], image: img(1), verified: true },
  { id: "19", name: "Chandigarh Agri Hub", type: "warehouse", location: "Chandigarh", state: "Punjab", distance: "5 km", rating: 4.4, reviews: 79, pricePerQuintal: 28, capacity: "5,500 MT", available: "2,000 MT", features: ["CCTV", "Security", "Fumigation", "Insurance"], image: img(2), verified: true },
  { id: "20", name: "Patiala Frozen Hub", type: "frozen", location: "Patiala", state: "Punjab", distance: "17 km", rating: 4.2, reviews: 48, pricePerQuintal: 70, capacity: "1,200 MT", available: "300 MT", temperature: "-20°C – -25°C", features: ["Blast Freezing", "Cold Chain", "HACCP"], image: img(3), verified: false },

  // UP & Bihar
  { id: "21", name: "Agra Cold Storage", type: "cold", location: "Agra", state: "UP", distance: "10 km", rating: 4.5, reviews: 115, pricePerQuintal: 38, capacity: "4,500 MT", available: "1,500 MT", temperature: "2°C – 8°C", features: ["Insurance", "CCTV", "Loading Dock", "24/7 Monitoring"], image: img(4), verified: true },
  { id: "22", name: "Lucknow Mega Silo", type: "silo", location: "Lucknow", state: "UP", distance: "20 km", rating: 4.0, reviews: 35, pricePerQuintal: 16, capacity: "25,000 MT", available: "12,000 MT", features: ["Rail Connected", "Aeration", "Weighbridge"], image: img(5), verified: false, tag: "Mega Silo" },
  { id: "23", name: "Varanasi Agri Depot", type: "warehouse", location: "Varanasi", state: "UP", distance: "8 km", rating: 4.3, reviews: 58, pricePerQuintal: 23, capacity: "6,000 MT", available: "2,500 MT", features: ["Fumigation", "CCTV", "Security"], image: img(6), verified: true },
  { id: "24", name: "Patna Fresh Cold", type: "cold", location: "Patna", state: "Bihar", distance: "12 km", rating: 4.4, reviews: 91, pricePerQuintal: 40, capacity: "3,000 MT", available: "900 MT", temperature: "2°C – 10°C", features: ["24/7 Monitoring", "CCTV", "Loading Dock"], image: img(7), verified: true },
  { id: "25", name: "Muzaffarpur CA Store", type: "ca", location: "Muzaffarpur", state: "Bihar", distance: "6 km", rating: 4.6, reviews: 107, pricePerQuintal: 58, capacity: "1,800 MT", available: "600 MT", temperature: "1°C – 4°C", features: ["CA Technology", "Litchi Specialist", "Humidity Control", "CCTV"], image: img(8), verified: true, tag: "Litchi Expert" },

  // Andhra Pradesh & Telangana
  { id: "26", name: "Hyderabad Cold Zone", type: "cold", location: "Hyderabad", state: "Telangana", distance: "7 km", rating: 4.7, reviews: 188, pricePerQuintal: 47, capacity: "5,000 MT", available: "1,400 MT", temperature: "2°C – 8°C", features: ["24/7 Monitoring", "Insurance", "Loading Dock", "CCTV"], image: img(9), verified: true },
  { id: "27", name: "Visakha Grain Store", type: "silo", location: "Visakhapatnam", state: "Andhra Pradesh", distance: "14 km", rating: 4.2, reviews: 56, pricePerQuintal: 18, capacity: "10,000 MT", available: "4,500 MT", features: ["Aeration", "Pest Control", "Rail Connected", "Weighbridge"], image: img(10), verified: true },
  { id: "28", name: "Vijayawada Warehouse", type: "warehouse", location: "Vijayawada", state: "Andhra Pradesh", distance: "5 km", rating: 4.4, reviews: 82, pricePerQuintal: 24, capacity: "7,000 MT", available: "3,000 MT", features: ["Fumigation", "Security", "CCTV", "Transport"], image: img(11), verified: true },
  { id: "29", name: "Guntur Chilli Store", type: "cold", location: "Guntur", state: "Andhra Pradesh", distance: "9 km", rating: 4.5, reviews: 99, pricePerQuintal: 43, capacity: "3,500 MT", available: "1,200 MT", temperature: "5°C – 12°C", features: ["Chilli Specialist", "Humidity Control", "CCTV", "Insurance"], image: img(12), verified: true, tag: "Chilli Expert" },
  { id: "30", name: "Warangal Agri Hub", type: "warehouse", location: "Warangal", state: "Telangana", distance: "11 km", rating: 4.1, reviews: 44, pricePerQuintal: 20, capacity: "5,500 MT", available: "2,200 MT", features: ["Fumigation", "Weighbridge", "Security"], image: img(13), verified: false },

  // Karnataka & Tamil Nadu
  { id: "31", name: "Bangalore Cold Hub", type: "cold", location: "Bengaluru", state: "Karnataka", distance: "8 km", rating: 4.8, reviews: 231, pricePerQuintal: 52, capacity: "4,000 MT", available: "800 MT", temperature: "2°C – 8°C", features: ["24/7 Monitoring", "AI Temp Control", "Insurance", "Loading Dock"], image: img(14), verified: true, tag: "AI Powered" },
  { id: "32", name: "Mysore Agri Silo", type: "silo", location: "Mysuru", state: "Karnataka", distance: "16 km", rating: 4.2, reviews: 53, pricePerQuintal: 19, capacity: "7,000 MT", available: "3,000 MT", features: ["Aeration", "Pest Control", "Weighbridge"], image: img(15), verified: true },
  { id: "33", name: "Chennai Frozen Store", type: "frozen", location: "Chennai", state: "Tamil Nadu", distance: "12 km", rating: 4.5, reviews: 121, pricePerQuintal: 72, capacity: "2,000 MT", available: "500 MT", temperature: "-18°C – -24°C", features: ["Blast Freezing", "IQF", "HACCP", "Export Ready"], image: img(0), verified: true, tag: "Export Ready" },
  { id: "34", name: "Coimbatore CA Store", type: "ca", location: "Coimbatore", state: "Tamil Nadu", distance: "7 km", rating: 4.7, reviews: 144, pricePerQuintal: 62, capacity: "2,500 MT", available: "700 MT", temperature: "2°C – 6°C", features: ["CA Technology", "O2 Control", "Humidity Control", "Insurance"], image: img(1), verified: true },
  { id: "35", name: "Madurai Warehouse", type: "warehouse", location: "Madurai", state: "Tamil Nadu", distance: "5 km", rating: 4.3, reviews: 67, pricePerQuintal: 23, capacity: "5,000 MT", available: "2,000 MT", features: ["Fumigation", "Security", "CCTV", "Weighbridge"], image: img(2), verified: true },

  // West Bengal & Odisha
  { id: "36", name: "Kolkata Mega Cold", type: "cold", location: "Kolkata", state: "West Bengal", distance: "6 km", rating: 4.6, reviews: 167, pricePerQuintal: 46, capacity: "6,000 MT", available: "1,800 MT", temperature: "2°C – 8°C", features: ["24/7 Monitoring", "CCTV", "Insurance", "Transport"], image: img(3), verified: true },
  { id: "37", name: "Siliguri Agri Hub", type: "warehouse", location: "Siliguri", state: "West Bengal", distance: "10 km", rating: 4.4, reviews: 88, pricePerQuintal: 22, capacity: "4,500 MT", available: "1,900 MT", features: ["Fumigation", "Security", "Loading Dock"], image: img(4), verified: true },
  { id: "38", name: "Bhubaneswar Cold Store", type: "cold", location: "Bhubaneswar", state: "Odisha", distance: "9 km", rating: 4.3, reviews: 61, pricePerQuintal: 41, capacity: "3,000 MT", available: "1,100 MT", temperature: "2°C – 10°C", features: ["24/7 Monitoring", "CCTV", "Loading Dock"], image: img(5), verified: true },
  { id: "39", name: "Cuttack Grain Silo", type: "silo", location: "Cuttack", state: "Odisha", distance: "13 km", rating: 4.0, reviews: 38, pricePerQuintal: 17, capacity: "8,000 MT", available: "4,000 MT", features: ["Aeration", "Pest Control", "Weighbridge"], image: img(6), verified: false },
  { id: "40", name: "Durgapur Agri Depot", type: "warehouse", location: "Durgapur", state: "West Bengal", distance: "7 km", rating: 4.5, reviews: 94, pricePerQuintal: 25, capacity: "6,500 MT", available: "2,800 MT", features: ["Fumigation", "CCTV", "Security", "Transport"], image: img(7), verified: true },

  // Rajasthan & MP
  { id: "41", name: "Jaipur Cool Storage", type: "cold", location: "Jaipur", state: "Rajasthan", distance: "11 km", rating: 4.5, reviews: 103, pricePerQuintal: 43, capacity: "4,000 MT", available: "1,300 MT", temperature: "2°C – 8°C", features: ["24/7 Monitoring", "CCTV", "Insurance", "Loading Dock"], image: img(8), verified: true },
  { id: "42", name: "Jodhpur Agri Silo", type: "silo", location: "Jodhpur", state: "Rajasthan", distance: "19 km", rating: 4.1, reviews: 45, pricePerQuintal: 18, capacity: "10,000 MT", available: "5,000 MT", features: ["Aeration", "Pest Control", "Rail Connected"], image: img(9), verified: false },
  { id: "43", name: "Bhopal Kisan Depot", type: "warehouse", location: "Bhopal", state: "MP", distance: "8 km", rating: 4.4, reviews: 76, pricePerQuintal: 24, capacity: "7,000 MT", available: "3,200 MT", features: ["Fumigation", "Weighbridge", "Security", "CCTV"], image: img(10), verified: true },
  { id: "44", name: "Gwalior Cold Hub", type: "cold", location: "Gwalior", state: "MP", distance: "6 km", rating: 4.3, reviews: 59, pricePerQuintal: 40, capacity: "2,800 MT", available: "900 MT", temperature: "2°C – 8°C", features: ["CCTV", "Insurance", "Loading Dock"], image: img(11), verified: true },
  { id: "45", name: "Ujjain Grain Center", type: "silo", location: "Ujjain", state: "MP", distance: "14 km", rating: 4.2, reviews: 48, pricePerQuintal: 16, capacity: "9,000 MT", available: "4,500 MT", features: ["Aeration System", "Pest Control", "Weighbridge", "Rail Connected"], image: img(12), verified: true },

  // Kerala & Goa
  { id: "46", name: "Kochi Export Cold", type: "frozen", location: "Kochi", state: "Kerala", distance: "8 km", rating: 4.8, reviews: 203, pricePerQuintal: 78, capacity: "2,500 MT", available: "600 MT", temperature: "-18°C – -22°C", features: ["Blast Freezing", "Export Ready", "HACCP", "Port Connected"], image: img(13), verified: true, tag: "Port Side" },
  { id: "47", name: "Thiruvananthapuram CA", type: "ca", location: "Thiruvananthapuram", state: "Kerala", distance: "11 km", rating: 4.6, reviews: 118, pricePerQuintal: 63, capacity: "1,800 MT", available: "500 MT", temperature: "2°C – 6°C", features: ["CA Technology", "O2 Control", "Humidity Monitor", "Insurance"], image: img(14), verified: true },
  { id: "48", name: "Calicut Agri Warehouse", type: "warehouse", location: "Kozhikode", state: "Kerala", distance: "5 km", rating: 4.4, reviews: 82, pricePerQuintal: 26, capacity: "4,000 MT", available: "1,600 MT", features: ["Fumigation", "CCTV", "Security", "Loading Dock"], image: img(15), verified: true },
  { id: "49", name: "Panaji Agri Cold", type: "cold", location: "Panaji", state: "Goa", distance: "9 km", rating: 4.5, reviews: 97, pricePerQuintal: 49, capacity: "2,000 MT", available: "700 MT", temperature: "2°C – 8°C", features: ["24/7 Monitoring", "Insurance", "CCTV"], image: img(0), verified: true },
  { id: "50", name: "Margao Frozen Hub", type: "frozen", location: "Margao", state: "Goa", distance: "12 km", rating: 4.2, reviews: 51, pricePerQuintal: 73, capacity: "1,200 MT", available: "350 MT", temperature: "-18°C – -22°C", features: ["Blast Freezing", "IQF Line", "HACCP"], image: img(1), verified: false },

  // Bonus extras
  { id: "51", name: "Dehradun Himalayan Cold", type: "cold", location: "Dehradun", state: "Uttarakhand", distance: "7 km", rating: 4.7, reviews: 136, pricePerQuintal: 46, capacity: "2,500 MT", available: "800 MT", temperature: "1°C – 5°C", features: ["Mountain Climate", "Insurance", "CCTV", "Loading Dock"], image: img(2), verified: true, tag: "Natural Cool" },
  { id: "52", name: "Ranchi Agri Hub", type: "warehouse", location: "Ranchi", state: "Jharkhand", distance: "10 km", rating: 4.3, reviews: 63, pricePerQuintal: 22, capacity: "5,000 MT", available: "2,100 MT", features: ["Fumigation", "Security", "CCTV"], image: img(3), verified: true },
  { id: "53", name: "Raipur Grain Silo", type: "silo", location: "Raipur", state: "Chhattisgarh", distance: "15 km", rating: 4.2, reviews: 49, pricePerQuintal: 17, capacity: "11,000 MT", available: "5,500 MT", features: ["Aeration", "Rail Connected", "Weighbridge", "Pest Control"], image: img(4), verified: true },
  { id: "54", name: "Guwahati Tea Cold Store", type: "cold", location: "Guwahati", state: "Assam", distance: "8 km", rating: 4.6, reviews: 122, pricePerQuintal: 48, capacity: "3,000 MT", available: "1,000 MT", temperature: "5°C – 15°C", features: ["Tea Specialist", "Humidity Control", "Insurance", "CCTV"], image: img(5), verified: true, tag: "Tea Expert" },
  { id: "55", name: "Imphal Agri Depot", type: "warehouse", location: "Imphal", state: "Manipur", distance: "6 km", rating: 4.1, reviews: 37, pricePerQuintal: 20, capacity: "3,000 MT", available: "1,400 MT", features: ["Security", "CCTV", "Fumigation"], image: img(6), verified: true },
];

const typeConfig: Record<FacilityType, { label: string; icon: typeof Warehouse; color: string; bg: string }> = {
  cold: { label: "Cold Storage", icon: Snowflake, color: "text-blue-400", bg: "bg-blue-400/15" },
  warehouse: { label: "Warehouse", icon: Warehouse, color: "text-amber-400", bg: "bg-amber-400/15" },
  silo: { label: "Grain Silo", icon: ThermometerSun, color: "text-emerald-400", bg: "bg-emerald-400/15" },
  ca: { label: "CA Store", icon: Wind, color: "text-purple-400", bg: "bg-purple-400/15" },
  frozen: { label: "Frozen", icon: Zap, color: "text-cyan-400", bg: "bg-cyan-400/15" },
};

const stats = [
  { icon: Warehouse, value: "55+", label: "Verified Facilities", color: "text-primary" },
  { icon: ShieldCheck, value: "100%", label: "Insured Storage", color: "text-emerald-400" },
  { icon: Truck, value: "24hr", label: "Delivery Support", color: "text-amber-400" },
  { icon: Clock, value: "Instant", label: "Booking Confirmation", color: "text-blue-400" },
];

const ALL_STATES = ["All States", ...Array.from(new Set(facilities.map(f => f.state))).sort()];

export default function Storage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("All States");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const [bookingForm, setBookingForm] = useState({
    commodity: "", quantity: "", startDate: "", duration: "1",
    contactName: "", contactPhone: "",
  });

  const bookingAmount = selectedFacility
    ? selectedFacility.pricePerQuintal * Number(bookingForm.quantity || 0) * Number(bookingForm.duration)
    : 0;

  const filtered = useMemo(() =>
    facilities
      .filter((f) => {
        const matchesSearch =
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.location.toLowerCase().includes(search.toLowerCase()) ||
          f.state.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "all" || f.type === typeFilter;
        const matchesState = stateFilter === "All States" || f.state === stateFilter;
        return matchesSearch && matchesType && matchesState;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price_asc") return a.pricePerQuintal - b.pricePerQuintal;
        if (sortBy === "price_desc") return b.pricePerQuintal - a.pricePerQuintal;
        if (sortBy === "reviews") return b.reviews - a.reviews;
        return 0;
      }),
    [search, typeFilter, stateFilter, sortBy]
  );

  const visibleFacilities = filtered.slice(0, visibleCount);

  const handleBook = (facility: Facility) => {
    setSelectedFacility(facility);
    setBookingOpen(true);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.commodity || !bookingForm.quantity || !bookingForm.startDate || !bookingForm.contactName || !bookingForm.contactPhone) {
      toast.error("Please fill all required fields");
      return;
    }
    if (bookingAmount <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    setBookingOpen(false);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    toast.success(`Booking confirmed for ${selectedFacility?.name}!`, {
      description: `${bookingForm.quantity} quintals of ${bookingForm.commodity} starting ${bookingForm.startDate}`,
    });
    setBookingForm({ commodity: "", quantity: "", startDate: "", duration: "1", contactName: "", contactPhone: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-heading font-bold text-foreground"
          >
            Storage Booking
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Find and book cold storage, warehouses & silos across India
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <BarChart3 className="w-4 h-4" />
          <span>{filtered.length} facilities found</span>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
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

      {/* Type Quick Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        <button
          onClick={() => setTypeFilter("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${typeFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
        >
          <Layers className="w-3.5 h-3.5" /> All Types
        </button>
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${typeFilter === key ? `${cfg.bg} ${cfg.color} border-current` : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
          >
            <cfg.icon className="w-3.5 h-3.5" /> {cfg.label}
          </button>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, or state..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(12); }}
              className="pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${showFilters ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col sm:flex-row gap-3 overflow-hidden"
            >
              <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setVisibleCount(12); }}>
                <SelectTrigger className="sm:w-52">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="sm:w-52">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">⭐ Top Rated</SelectItem>
                  <SelectItem value="price_asc">↑ Lowest Price</SelectItem>
                  <SelectItem value="price_desc">↓ Highest Price</SelectItem>
                  <SelectItem value="reviews">💬 Most Reviewed</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => { setSearch(""); setTypeFilter("all"); setStateFilter("All States"); setSortBy("rating"); setVisibleCount(12); }}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
              >
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Grid / List View */}
      {viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {visibleFacilities.map((facility, i) => {
              const config = typeConfig[facility.type];
              return (
                <motion.div
                  key={facility.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="glass-card-hover rounded-xl overflow-hidden group"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color} backdrop-blur-sm`}>
                      <config.icon className="w-3 h-3" />
                      {config.label}
                    </span>
                    {facility.verified && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/90 text-white">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {facility.tag && (
                      <span className="absolute bottom-3 left-3 inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-accent/90 text-accent-foreground">
                        {facility.tag}
                      </span>
                    )}
                    {facility.temperature && (
                      <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-mono font-medium text-foreground">
                        {facility.temperature}
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{facility.name}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {facility.location}, {facility.state} · {facility.distance}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-semibold text-foreground">{facility.rating}</span>
                        <span className="text-muted-foreground">({facility.reviews})</span>
                      </div>
                      <div className="flex items-center font-mono font-semibold text-foreground">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {facility.pricePerQuintal}
                        <span className="text-muted-foreground font-normal text-xs ml-0.5">/qtl/mo</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Capacity: {facility.capacity}</span>
                      <span className="text-emerald-500 font-medium">Available: {facility.available}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {facility.features.slice(0, 3).map((f) => (
                        <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>
                      ))}
                      {facility.features.length > 3 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{facility.features.length - 3}</span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleBook(facility)}
                      className="w-full gradient-hero text-primary-foreground border-0 hover:opacity-90 group/btn"
                    >
                      <CreditCard className="w-4 h-4 mr-1" /> Book & Pay
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visibleFacilities.map((facility, i) => {
              const config = typeConfig[facility.type];
              return (
                <motion.div
                  key={facility.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: Math.min(i * 0.03, 0.25) }}
                  className="glass-card-hover rounded-xl overflow-hidden"
                >
                  <div className="flex gap-0">
                    <div className="relative w-32 sm:w-48 flex-shrink-0 overflow-hidden">
                      <img
                        src={facility.image}
                        alt={facility.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {facility.temperature && (
                        <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-mono font-medium text-foreground text-center">
                          {facility.temperature}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="font-heading font-semibold text-foreground">{facility.name}</h3>
                          {facility.verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                          {facility.tag && (
                            <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">
                              {facility.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {facility.location}, {facility.state} · {facility.distance}
                        </div>
                        <div className="flex items-center gap-3 text-sm flex-wrap">
                          <span className={`inline-flex items-center gap-1 ${config.color}`}>
                            <config.icon className="w-3.5 h-3.5" />{config.label}
                          </span>
                          <span className="text-muted-foreground">Cap: {facility.capacity}</span>
                          <span className="text-emerald-500 font-medium">Avail: {facility.available}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {facility.features.slice(0, 4).map((f) => (
                            <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:min-w-[140px]">
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                            <span className="font-semibold text-foreground text-sm">{facility.rating}</span>
                            <span className="text-muted-foreground text-xs">({facility.reviews})</span>
                          </div>
                          <div className="flex items-center font-mono font-bold text-foreground text-lg justify-end">
                            <IndianRupee className="w-4 h-4" />
                            {facility.pricePerQuintal}
                          </div>
                          <div className="text-xs text-muted-foreground text-right">per qtl/month</div>
                        </div>
                        <Button
                          onClick={() => handleBook(facility)}
                          size="sm"
                          className="gradient-hero text-primary-foreground border-0 hover:opacity-90 whitespace-nowrap"
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1" /> Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Load More */}
      {visibleCount < filtered.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-2">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((c) => c + 12)}
            className="gap-2"
          >
            <ChevronDown className="w-4 h-4" />
            Load More ({filtered.length - visibleCount} remaining)
          </Button>
        </motion.div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Warehouse className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No facilities found matching your criteria</p>
          <button
            onClick={() => { setSearch(""); setTypeFilter("all"); setStateFilter("All States"); }}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Book Storage</DialogTitle>
            <DialogDescription>
              {selectedFacility && (
                <span className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedFacility.name} · {selectedFacility.location}, {selectedFacility.state}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitBooking} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Commodity *</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="e.g. Wheat, Rice" value={bookingForm.commodity} onChange={(e) => setBookingForm({ ...bookingForm, commodity: e.target.value })} className="pl-10" maxLength={100} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Quantity (Quintals) *</label>
                <Input type="number" placeholder="e.g. 100" value={bookingForm.quantity} onChange={(e) => setBookingForm({ ...bookingForm, quantity: e.target.value })} min="1" max="100000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Start Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="date" value={bookingForm.startDate} onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Duration</label>
                <Select value={bookingForm.duration} onValueChange={(v) => setBookingForm({ ...bookingForm, duration: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Contact Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Your name" value={bookingForm.contactName} onChange={(e) => setBookingForm({ ...bookingForm, contactName: e.target.value })} className="pl-10" maxLength={100} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="+91 XXXXX XXXXX" value={bookingForm.contactPhone} onChange={(e) => setBookingForm({ ...bookingForm, contactPhone: e.target.value })} className="pl-10" maxLength={15} />
                </div>
              </div>
            </div>

            {selectedFacility && (
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-mono text-foreground">₹{selectedFacility.pricePerQuintal}/qtl/month</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quantity × Duration</span>
                  <span className="font-mono text-foreground">{bookingForm.quantity || 0} qtl × {bookingForm.duration} mo</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Amount</span>
                  <span className="font-mono font-bold text-lg text-foreground">₹{bookingAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full gradient-warm text-secondary-foreground border-0 hover:opacity-90 h-11">
              <CreditCard className="w-4 h-4 mr-2" /> Proceed to Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={bookingAmount}
        description={`Storage booking at ${selectedFacility?.name}`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}