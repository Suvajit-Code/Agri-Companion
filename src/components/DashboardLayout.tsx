import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Wheat, Bot, CloudSun, TrendingUp, ShoppingCart,
  Warehouse, Handshake, MessageCircle, Users, BookOpen, Receipt, Briefcase,
  Settings, Bell, Search, ChevronLeft, ChevronRight, LogOut, Menu, X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const mockNotifications = [
  { id: 1, text: "AI recommended Mustard for Rabi season", time: "2h ago", color: "text-primary" },
  { id: 2, text: "Tomato prices up by 12% in Azadpur", time: "4h ago", color: "text-success" },
  { id: 3, text: "New order received — 50kg Organic Rice", time: "1d ago", color: "text-info" },
];

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Wheat, label: "My Farms", path: "/dashboard/farms" },
  { icon: Bot, label: "AI Recommendations", path: "/dashboard/ai" },
  { icon: CloudSun, label: "Weather Insights", path: "/dashboard/weather" },
  { icon: TrendingUp, label: "Market Prices", path: "/dashboard/market" },
  { icon: ShoppingCart, label: "Marketplace", path: "/dashboard/shop" },
  { icon: Warehouse, label: "Storage", path: "/dashboard/storage" },
  { icon: Handshake, label: "Farmer-to-Market", path: "/dashboard/sell" },
  { icon: Briefcase, label: "Expert Consultancy", path: "/dashboard/experts" },
  { icon: MessageCircle, label: "AI Chatbot", path: "/dashboard/chat" },
  { icon: Users, label: "Community", path: "/dashboard/community" },
  { icon: BookOpen, label: "Knowledge Base", path: "/dashboard/learn" },
  { icon: Receipt, label: "Orders & Sales", path: "/dashboard/orders" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const displayName = user?.full_name || user?.email || "User";
  const initials = (displayName || "U").split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo size={collapsed ? "sm" : "md"} animated={false} />
        </Link>
        <button className="lg:hidden ml-auto text-sidebar-foreground" onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4 border-t border-sidebar-border pt-3 shrink-0 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full gradient-warm flex items-center justify-center text-secondary-foreground font-heading font-bold text-xs shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-sidebar-foreground/50">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-64"} bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 hidden lg:flex flex-col fixed h-screen z-40`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col animate-slide-in-right">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 ${collapsed ? "lg:ml-16" : "lg:ml-64"} transition-all duration-300`}>
        {/* Top bar */}
        <header className="h-14 sm:h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-3 bg-muted/70 rounded-xl px-3 py-2 w-72">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search crops, products, mandis..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle className="text-muted-foreground" />
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center">3</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm">Notifications</h4>
                  <button onClick={() => navigate("/dashboard")} className="text-[10px] text-primary hover:underline font-medium">View All</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {mockNotifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer">
                      <p className="text-xs text-foreground leading-snug">{n.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <button onClick={() => navigate("/dashboard/settings")} className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-xs hover:opacity-90 transition-all border-2 border-transparent hover:border-primary/20 focus:outline-none">
              {initials}
            </button>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}