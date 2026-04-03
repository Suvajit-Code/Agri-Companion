import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useDashboardNotifications } from "@/hooks/useDashboardNotifications";
import {
  Bot, CloudSun, TrendingUp, ShoppingCart, Warehouse, Handshake,
  Wheat, ArrowRight, BarChart3, Zap,
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

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, loading: notificationsLoading, clearNotifications } = useDashboardNotifications(user?.id);
  const firstName = user?.full_name?.split(" ")[0] || "Farmer";

  const getNotificationStyle = (type: string) => {
    if (type === "community") {
      return {
        icon: TrendingUp,
        color: "bg-success/10 text-success",
      };
    }

    return {
      icon: Warehouse,
      color: "bg-warning/10 text-warning",
    };
  };

  return (
    <>
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-heading font-bold text-foreground">
          Good morning, {firstName}! 🌾
        </motion.h1>
        <p className="text-muted-foreground text-base mt-2">Here's what's happening on your farms today.</p>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 group-hover:from-primary/10 group-hover:to-accent/10 transition-colors duration-300" />
            
            {/* Border */}
            <div className="absolute inset-0 border border-primary/10 group-hover:border-primary/20 transition-colors duration-300 rounded-2xl" />
            
            <div className="relative p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  stat.label === "Active Farms" ? "from-green-400 to-green-600" :
                  stat.label === "Active Orders" ? "from-blue-400 to-blue-600" :
                  stat.label === "Storage Bookings" ? "from-amber-400 to-amber-600" :
                  "from-purple-400 to-purple-600"
                } flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  stat.label === "Active Farms" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  stat.label === "Active Orders" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                  stat.label === "Storage Bookings" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                }`}>{stat.change}</span>
              </div>
              <p className="font-heading font-bold text-3xl text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
          className="relative group rounded-2xl overflow-hidden backdrop-blur-sm"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 group-hover:from-primary/10 group-hover:to-accent/10 transition-colors duration-300" />
          
          {/* Border */}
          <div className="absolute inset-0 border border-primary/10 group-hover:border-primary/20 transition-colors duration-300 rounded-2xl" />
          
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-lg text-foreground">Quick Actions</h3>
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-accent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-300 group/action border border-transparent bg-gradient-to-br from-muted/30 to-muted/10 hover:from-primary/10 hover:to-accent/10 hover:border-primary/20 hover:shadow-md active:scale-95"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.gradient} flex items-center justify-center shadow-md group-hover/action:shadow-lg transition-all duration-300 group-hover/action:scale-110`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-foreground text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Weather Widget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl"
          onClick={() => navigate("/dashboard/weather")}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-primary/5 to-cyan-400/10 group-hover:from-blue-400/15 group-hover:via-primary/10 group-hover:to-cyan-400/15 transition-colors duration-300" />
          
          {/* Border */}
          <div className="absolute inset-0 border border-blue-400/20 group-hover:border-blue-400/30 transition-colors duration-300 rounded-2xl" />
          
          <div className="relative p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-lg text-foreground">Weather Today</h3>
              <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CloudSun className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl">
                ☀️
              </motion.div>
              <div>
                <p className="font-heading font-bold text-4xl text-foreground">32°C</p>
                <p className="text-sm text-muted-foreground mt-1">Partly cloudy · Humidity 65%</p>
              </div>
              <div className="mt-5 flex justify-center gap-2 text-xs text-muted-foreground">
                {["Mon 30°", "Tue 28°", "Wed 🌧 24°", "Thu 29°"].map((d) => (
                  <span key={d} className="bg-gradient-to-br from-blue-400/10 to-cyan-400/10 border border-blue-400/10 rounded-lg px-3 py-2 font-mono font-medium text-foreground/70 hover:border-blue-400/20 transition-colors">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} 
          className="relative group rounded-2xl overflow-hidden backdrop-blur-sm"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 group-hover:from-primary/10 group-hover:to-accent/10 transition-colors duration-300" />
          
          {/* Border */}
          <div className="absolute inset-0 border border-primary/10 group-hover:border-primary/20 transition-colors duration-300 rounded-2xl" />
          
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-lg text-foreground">Notification History</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 font-semibold"
                onClick={clearNotifications}
              >
                Clear all
              </Button>
            </div>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-hide">
              {notificationsLoading ? (
                <div className="text-sm text-muted-foreground text-center py-6">Loading notification history...</div>
              ) : notifications.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-6">No activity yet.</div>
              ) : (
                notifications.map((activity, i) => {
                  const style = getNotificationStyle(activity.type);
                  const Icon = style.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg border border-transparent bg-gradient-to-br from-muted/30 to-muted/10 hover:from-primary/10 hover:to-accent/10 hover:border-primary/20 transition-all duration-300 cursor-pointer group/notification"
                      onClick={() => navigate(activity.href)}
                    >
                      <div className={`w-10 h-10 rounded-lg ${style.color} flex items-center justify-center shrink-0 mt-0 group-hover/notification:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug">{activity.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover/notification:text-primary/70 group-hover/notification:translate-x-1 transition-all duration-300 shrink-0 mt-0.5" />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}