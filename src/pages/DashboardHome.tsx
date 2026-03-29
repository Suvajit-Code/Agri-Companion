import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Bot, CloudSun, TrendingUp, ShoppingCart, Warehouse, Handshake,
  Wheat, ArrowRight, Bell, Users, BarChart3, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const quickStats = [
  { label: "Active Farms", value: "3", icon: Wheat, change: "+1 new", color: "text-primary" },
  { label: "Active Orders", value: "7", icon: ShoppingCart, change: "2 pending", color: "text-info" },
  { label: "Storage Bookings", value: "2", icon: Warehouse, change: "All active", color: "text-warning" },
  { label: "Revenue (₹)", value: "1.2L", icon: BarChart3, change: "+12% this month", color: "text-success" },
];

const quickActions = [
  { label: "Get AI Advice", icon: Bot, path: "/dashboard/ai", gradient: "gradient-hero" },
  { label: "Shop Now", icon: ShoppingCart, path: "/dashboard/shop", gradient: "gradient-warm" },
  { label: "Book Storage", icon: Warehouse, path: "/dashboard/storage", gradient: "gradient-hero" },
  { label: "Sell Direct", icon: Handshake, path: "/dashboard/sell", gradient: "gradient-warm" },
];

const recentActivities = [
  { text: "AI recommended Mustard for Rabi season", time: "2h ago", icon: Bot, color: "bg-primary/10 text-primary" },
  { text: "Tomato prices up by 12% in Azadpur Mandi", time: "4h ago", icon: TrendingUp, color: "bg-success/10 text-success" },
  { text: "Cold storage booking confirmed", time: "1d ago", icon: Warehouse, color: "bg-warning/10 text-warning" },
  { text: "New order received — 50kg Organic Rice", time: "1d ago", icon: ShoppingCart, color: "bg-info/10 text-info" },
  { text: "Weather alert: Heavy rain expected tomorrow", time: "2d ago", icon: CloudSun, color: "bg-destructive/10 text-destructive" },
];

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] || "Farmer";

  return (
    <>
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-heading font-bold text-foreground">
          Good morning, {firstName}! 🌾
        </motion.h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening on your farms today.</p>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card rounded-xl p-5 hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-[10px] text-success font-medium bg-success/10 px-2 py-0.5 rounded-full">{stat.change}</span>
            </div>
            <p className="font-mono font-bold text-2xl text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">Quick Actions</h3>
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all group hover:scale-105 active:scale-95"
              >
                <div className={`w-10 h-10 rounded-xl ${action.gradient} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Weather Widget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card rounded-xl p-6 cursor-pointer hover:shadow-[var(--shadow-hover)] transition-all"
          onClick={() => navigate("/dashboard/weather")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">Weather Today</h3>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-center">
            <div className="text-6xl mb-3 animate-float">☀️</div>
            <p className="font-mono font-bold text-4xl text-foreground">32°C</p>
            <p className="text-sm text-muted-foreground mt-1">Partly cloudy · Humidity 65%</p>
            <div className="mt-4 flex justify-center gap-3 text-xs text-muted-foreground">
              {["Mon 30°", "Tue 28°", "Wed 🌧 24°", "Thu 29°"].map((d) => (
                <span key={d} className="bg-muted/50 rounded-lg px-2.5 py-1.5 font-mono">{d}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">Notification History</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10">
              Clear all
            </Button>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-hide">
            {recentActivities.map((activity, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg ${activity.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground leading-snug">{activity.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}