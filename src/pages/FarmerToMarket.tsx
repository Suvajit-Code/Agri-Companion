import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Package, Plus, Search, MapPin, Star, Phone, MessageCircle,
  TrendingUp, Users, IndianRupee, Filter, Eye, Handshake, Wheat,
  Apple, Carrot, Leaf, CheckCircle2, Clock, AlertCircle,
  Trash2, Edit, Camera, Upload, X, Send, Download,
  SlidersHorizontal, User as UserIcon
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  quality: string;
  status: "active" | "negotiating" | "sold";
  listedDate: string;
  image: string;
  inquiries: number;
  description?: string;
}

interface Buyer {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  totalDeals: number;
  interestedIn: string[];
  verified: boolean;
  phone: string;
  lastActive: string;
}

const mockProducts: Product[] = [
  { id: "P1", name: "Basmati Rice", category: "Grains", quantity: 500, unit: "Quintals", pricePerUnit: 3200, location: "Karnal, Haryana", quality: "Grade A", status: "active", listedDate: "2026-02-10", image: "🌾", inquiries: 12 },
  { id: "P2", name: "Organic Tomatoes", category: "Vegetables", quantity: 50, unit: "Quintals", pricePerUnit: 2800, location: "Nashik, Maharashtra", quality: "Premium", status: "negotiating", listedDate: "2026-02-08", image: "🍅", inquiries: 8 },
  { id: "P3", name: "Alphonso Mangoes", category: "Fruits", quantity: 200, unit: "Boxes", pricePerUnit: 1500, location: "Ratnagiri, Maharashtra", quality: "Export", status: "active", listedDate: "2026-02-12", image: "🥭", inquiries: 25 },
  { id: "P4", name: "Green Cardamom", category: "Spices", quantity: 10, unit: "Quintals", pricePerUnit: 95000, location: "Idukki, Kerala", quality: "Grade A", status: "sold", listedDate: "2026-01-28", image: "🌿", inquiries: 30 },
  { id: "P5", name: "Fresh Potatoes", category: "Vegetables", quantity: 300, unit: "Quintals", pricePerUnit: 1200, location: "Agra, UP", quality: "Standard", status: "active", listedDate: "2026-02-13", image: "🥔", inquiries: 5 },
];

const mockBuyers: Buyer[] = [
  { id: "B1", name: "FreshMart Wholesale", type: "Wholesaler", location: "Delhi NCR", rating: 4.8, totalDeals: 256, interestedIn: ["Grains", "Vegetables"], verified: true, phone: "+91 98765 43210", lastActive: "2 hours ago" },
  { id: "B2", name: "Organic Foods Co.", type: "Retailer", location: "Mumbai", rating: 4.6, totalDeals: 142, interestedIn: ["Fruits", "Vegetables"], verified: true, phone: "+91 87654 32109", lastActive: "30 min ago" },
  { id: "B3", name: "SpiceTraders India", type: "Exporter", location: "Kochi", rating: 4.9, totalDeals: 89, interestedIn: ["Spices", "Grains"], verified: true, phone: "+91 76543 21098", lastActive: "1 hour ago" },
  { id: "B4", name: "AgroLink Distributors", type: "Distributor", location: "Pune", rating: 4.3, totalDeals: 178, interestedIn: ["Grains", "Fruits", "Vegetables"], verified: false, phone: "+91 65432 10987", lastActive: "5 hours ago" },
  { id: "B5", name: "Green Basket Retail", type: "Retailer", location: "Bangalore", rating: 4.7, totalDeals: 64, interestedIn: ["Fruits", "Vegetables"], verified: true, phone: "+91 54321 09876", lastActive: "15 min ago" },
];

const categories = ["All", "Grains", "Vegetables", "Fruits", "Spices"];
const categoryIcons: Record<string, React.ReactNode> = {
  Grains: <Wheat className="w-4 h-4" />,
  Vegetables: <Carrot className="w-4 h-4" />,
  Fruits: <Apple className="w-4 h-4" />,
  Spices: <Leaf className="w-4 h-4" />,
};

const statusConfig = {
  active: { label: "Active", icon: CheckCircle2, variant: "default" as const },
  negotiating: { label: "Negotiating", icon: Clock, variant: "secondary" as const },
  sold: { label: "Sold", icon: Handshake, variant: "outline" as const },
};

export default function FarmerToMarket() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [connectingBuyer, setConnectingBuyer] = useState<Buyer | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [buyerTypeFilter, setBuyerTypeFilter] = useState("All");
  
  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQuantity, setMinQuantity] = useState("");

  const [connectMessage, setConnectMessage] = useState("");

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    category: "Grains",
    quality: "Standard",
    quantity: "",
    unit: "Quintals",
    pricePerUnit: "",
    description: "",
    location: "Nashik, Maharashtra"
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    
    const matchMinPrice = minPrice === "" || p.pricePerUnit >= Number(minPrice);
    const matchMaxPrice = maxPrice === "" || p.pricePerUnit <= Number(maxPrice);
    const matchMinQty = minQuantity === "" || p.quantity >= Number(minQuantity);

    return matchSearch && matchCategory && matchMinPrice && matchMaxPrice && matchMinQty;
  });

  // Simulation of real-time notification
  useEffect(() => {
    if (!user) return;
    
    const timer = setTimeout(() => {
      toast.info("New Inquiry Received!", {
        description: "FreshMart Wholesale is asking about your Basmati Rice.",
      });
    }, 15000);

    return () => clearTimeout(timer);
  }, [user]);

  const filteredBuyers = mockBuyers.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.location.toLowerCase().includes(search.toLowerCase());
    const matchType = buyerTypeFilter === "All" || b.type === buyerTypeFilter;
    return matchSearch && matchType;
  });

  const stats = [
    { label: "Active Listings", value: products.filter((p) => p.status === "active").length, icon: Package, color: "text-primary" },
    { label: "Total Inquiries", value: products.reduce((s, p) => s + p.inquiries, 0), icon: MessageCircle, color: "text-secondary" },
    { label: "Connected Buyers", value: mockBuyers.length, icon: Users, color: "text-accent-foreground" },
    { label: "Revenue (est.)", value: "₹4.8L", icon: TrendingUp, color: "text-primary" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      setProducts(products.filter(p => p.id !== id));
      toast.success("Listing deleted successfully");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      quality: product.quality,
      quantity: product.quantity.toString(),
      unit: product.unit,
      pricePerUnit: product.pricePerUnit.toString(),
      description: product.description || "",
      location: product.location,
    });
    setImagePreview(product.image.startsWith("data:") ? product.image : null);
    setShowAddProduct(true);
  };

  const handleListProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.name || !formData.quantity || !formData.pricePerUnit) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newProduct: Product = {
      id: editingProduct?.id || `P${Date.now()}`,
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      pricePerUnit: Number(formData.pricePerUnit),
      location: formData.location,
      quality: formData.quality,
      status: editingProduct?.status || "active",
      listedDate: editingProduct?.listedDate || new Date().toISOString().split('T')[0],
      image: imagePreview || editingProduct?.image || "🌾",
      inquiries: editingProduct?.inquiries || 0,
      description: formData.description,
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
      toast.success("Listing updated successfully");
    } else {
      setProducts([newProduct, ...products]);
      toast.success("New product listed successfully");
    }

    setShowAddProduct(false);
    setEditingProduct(null);
    setFormData({
      name: "", category: "Grains", quality: "Standard", quantity: "",
      unit: "Quintals", pricePerUnit: "", description: "", location: "Nashik, Maharashtra"
    });
    setImagePreview(null);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Category", "Quantity", "Unit", "Price", "Location", "Quality", "Status", "Date"];
    const rows = products.map(p => [
      p.id, p.name, p.category, p.quantity, p.unit, p.pricePerUnit, `"${p.location}"`, p.quality, p.status, p.listedDate
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `my_listings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Listing exported as CSV");
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
    toast.info(`Initiating call to ${phone}`);
  };

  const handleConnect = (buyer: Buyer) => {
    setConnectingBuyer(buyer);
    setConnectMessage(`Hello ${buyer.name}, I am interested in connecting with you regarding my recent produce listings.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Farmer-to-Market</h1>
          <p className="text-muted-foreground text-sm">List your produce and connect directly with buyers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={() => {
            setEditingProduct(null);
            setImagePreview(null);
            setShowAddProduct(true);
          }} className="gap-2">
            <Plus className="w-4 h-4" /> List New Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="buyers">Find Buyers</TabsTrigger>
        </TabsList>

        {/* --- Listings Tab --- */}
        <TabsContent value="listings" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search products or locations..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button 
              variant="outline" 
              className={`gap-2 ${showAdvancedFilters ? "bg-primary/10 border-primary" : ""}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <Button key={c} variant={categoryFilter === c ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(c)} className="gap-1.5">
                  {categoryIcons[c]} {c}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filter Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 border rounded-xl bg-muted/30 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Min Price (₹)</Label>
                    <Input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max Price (₹)</Label>
                    <Input type="number" placeholder="No limit" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Min Quantity</Label>
                    <Input type="number" placeholder="0" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const status = statusConfig[product.status];
                return (
                  <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                              {product.image.startsWith("data:") ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-3xl">{product.image}</span>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base">{product.name}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {product.location}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={status.variant} className="gap-1 text-xs">
                              <status.icon className="w-3 h-3" /> {status.label}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Quantity</p>
                            <p className="font-medium text-foreground">{product.quantity} {product.unit}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Price</p>
                            <p className="font-medium text-foreground flex items-center gap-0.5">
                              <IndianRupee className="w-3 h-3" />{product.pricePerUnit.toLocaleString()}/{product.unit === "Boxes" ? "Box" : "Qtl"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Quality</p>
                            <p className="font-medium text-foreground">{product.quality}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Inquiries</p>
                            <p className="font-medium text-foreground">{product.inquiries}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setViewingProduct(product)}>
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                          <Button variant="secondary" size="sm" className="flex-1 gap-1" onClick={() => setInquiryProduct(product)}>
                            <MessageCircle className="w-3.5 h-3.5" /> Inquiries
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No products found. Try adjusting your filters.</p>
            </div>
          )}
        </TabsContent>

        {/* --- Buyers Tab --- */}
        <TabsContent value="buyers" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search buyers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={buyerTypeFilter} onValueChange={setBuyerTypeFilter}>
              <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                {["All", "Wholesaler", "Retailer", "Exporter", "Distributor"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredBuyers.map((buyer) => (
                <motion.div key={buyer.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{buyer.name}</CardTitle>
                            {buyer.verified && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {buyer.location}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{buyer.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Rating</p>
                          <p className="font-medium text-foreground flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {buyer.rating}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Deals Done</p>
                          <p className="font-medium text-foreground">{buyer.totalDeals}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Interested In</p>
                        <div className="flex flex-wrap gap-1">
                          {buyer.interestedIn.map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-[10px]">{cat}</Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Active {buyer.lastActive}</p>
                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setSelectedBuyer(buyer)}><Eye className="w-3.5 h-3.5" /> Profile</Button>
                        <Button size="sm" className="flex-1 gap-1" onClick={() => handleConnect(buyer)}><Handshake className="w-3.5 h-3.5" /> Connect</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={(open) => {
        setShowAddProduct(open);
        if (!open) {
          setEditingProduct(null);
          setImagePreview(null);
        }
      }}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "List New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update your listing details below." : "Add your produce to the marketplace for buyers to discover."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleListProduct} className="space-y-4">
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted cursor-pointer overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" /> Browse Image
                  </Button>
                  <p className="text-[10px] text-muted-foreground">JPG, PNG or WEBP. Max 2MB.</p>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input placeholder="e.g. Basmati Rice" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== "All").map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quality Grade</Label>
                <Select value={formData.quality} onValueChange={(v) => setFormData({ ...formData, quality: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Standard", "Grade A", "Premium", "Export"].map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" placeholder="e.g. 500" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Quintals", "Tonnes", "Kg", "Boxes"].map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Price per Unit (₹)</Label>
              <Input type="number" placeholder="e.g. 3200" value={formData.pricePerUnit} onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g. Nashik, Maharashtra" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea placeholder="Describe quality, harvest date, certifications..." rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" onClick={() => handleListProduct()}>{editingProduct ? "Save Changes" : "List Product"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product View Dialog */}
      <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          {viewingProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingProduct.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {viewingProduct.location}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {viewingProduct.image.startsWith("data:") ? (
                    <img src={viewingProduct.image} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">{viewingProduct.image}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Stock</p>
                    <p className="text-lg font-bold">{viewingProduct.quantity} {viewingProduct.unit}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Price</p>
                    <p className="text-lg font-bold">₹{viewingProduct.pricePerUnit.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quality</span>
                    <span className="font-medium">{viewingProduct.quality}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{viewingProduct.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Listed On</span>
                    <span className="font-medium">{viewingProduct.listedDate}</span>
                  </div>
                </div>
                {viewingProduct.description && (
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-sm italic">{viewingProduct.description}</p>
                  </div>
                )}
                <div className="space-y-2 pt-2">
                  <Button variant="outline" className="w-full gap-2" onClick={() => {
                    setViewingProduct(null);
                    handleEdit(viewingProduct);
                  }}>
                    <Edit className="w-4 h-4" /> Edit
                  </Button>
                  <Button variant="destructive" className="w-full gap-2" onClick={() => {
                    setViewingProduct(null);
                    handleDelete(viewingProduct.id);
                  }}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                  <DialogClose asChild>
                    <Button variant="ghost" className="w-full">Close</Button>
                  </DialogClose>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Inquiries Chat Simulation Dialog */}
      <Dialog open={!!inquiryProduct} onOpenChange={() => setInquiryProduct(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md h-[80vh] sm:h-[500px] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Inquiries: {inquiryProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">B1</div>
              <div className="bg-muted p-3 rounded-2xl rounded-tl-none text-sm">
                Is the price negotiable for a bulk order of 200 quintals?
              </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 text-xs font-bold">YOU</div>
              <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none text-sm">
                Yes, we can discuss a discount for that volume.
              </div>
            </div>
          </div>
          <div className="p-4 border-t flex gap-2">
            <Input placeholder="Type a message..." />
            <Button size="icon"><Send className="w-4 h-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Buyer Connect Dialog */}
      <Dialog open={!!connectingBuyer} onOpenChange={() => setConnectingBuyer(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md h-[80vh] sm:h-[500px] flex flex-col p-0 overflow-hidden">
          {connectingBuyer && (
            <>
              <DialogHeader className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle>Connect with {connectingBuyer.name}</DialogTitle>
                    <DialogDescription className="text-xs">
                      {connectingBuyer.type} • {connectingBuyer.location} • {connectingBuyer.rating} ★
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground italic border">
                  Initiating direct chat. Verified buyers usually respond within 2-4 hours.
                </div>
              </div>
              <div className="p-4 border-t bg-background flex gap-2">
                <Input 
                  placeholder="Type your message..." 
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                />
                <Button size="icon" onClick={() => {
                  toast.success(`Message sent to ${connectingBuyer.name}`);
                  setConnectingBuyer(null);
                }}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Buyer Profile Dialog */}
      <Dialog open={!!selectedBuyer} onOpenChange={() => setSelectedBuyer(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          {selectedBuyer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{selectedBuyer.name}</DialogTitle>
                  {selectedBuyer.verified && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </Badge>
                  )}
                </div>
                <DialogDescription>{selectedBuyer.type} • {selectedBuyer.location}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> {selectedBuyer.rating}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedBuyer.totalDeals}</p>
                    <p className="text-xs text-muted-foreground">Deals Completed</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Interested Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBuyer.interestedIn.map((cat) => (
                      <Badge key={cat} variant="secondary" className="gap-1">{categoryIcons[cat]} {cat}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" onClick={() => handleCall(selectedBuyer.phone)}>
                    <Phone className="w-4 h-4" /> Call Buyer
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => handleMessage(selectedBuyer.name)}>
                    <MessageCircle className="w-4 h-4" /> Message
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
