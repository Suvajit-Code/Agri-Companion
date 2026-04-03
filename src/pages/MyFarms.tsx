import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import {
  Wheat, MapPin, Droplets, Thermometer, Plus, Pencil, Trash2,
  Sprout, Calendar, BarChart3, Leaf, Sun, TrendingUp, X, PlusCircle, Camera, Upload
} from "lucide-react";
import { toast } from "sonner";

interface Farm {
  id: number;
  name: string;
  location: string;
  size: number;
  unit: string;
  soilType: string;
  irrigation: string;
  image?: string;
  crops: { name: string; status: string; plantedDate: string; expectedHarvest: string; health: string; image?: string }[];
}

const initialFarms: Farm[] = [
  {
    id: 1, name: "Green Valley Farm", location: "Nashik, Maharashtra", size: 5.5, unit: "Acres", soilType: "Black Cotton Soil", irrigation: "Drip Irrigation",
    crops: [
      { name: "Wheat", status: "Growing", plantedDate: "2025-11-15", expectedHarvest: "2026-03-20", health: "Healthy" },
      { name: "Onion", status: "Harvesting", plantedDate: "2025-09-01", expectedHarvest: "2026-01-15", health: "Good" },
    ],
  },
  {
    id: 2, name: "Sunrise Fields", location: "Pune, Maharashtra", size: 3.2, unit: "Acres", soilType: "Red Soil", irrigation: "Sprinkler",
    crops: [
      { name: "Tomato", status: "Growing", plantedDate: "2025-12-01", expectedHarvest: "2026-03-01", health: "Needs Attention" },
      { name: "Chilli", status: "Seedling", plantedDate: "2026-01-10", expectedHarvest: "2026-05-15", health: "Healthy" },
    ],
  },
  {
    id: 3, name: "Riverside Plot", location: "Kolhapur, Maharashtra", size: 8.0, unit: "Acres", soilType: "Alluvial Soil", irrigation: "Canal",
    crops: [
      { name: "Sugarcane", status: "Growing", plantedDate: "2025-06-15", expectedHarvest: "2026-06-15", health: "Healthy" },
    ],
  },
];

const healthColor: Record<string, string> = { Healthy: "bg-green-500/10 text-green-700", Good: "bg-blue-500/10 text-blue-700", "Needs Attention": "bg-yellow-500/10 text-yellow-700" };
const statusColor: Record<string, string> = { Growing: "bg-primary/10 text-primary", Harvesting: "bg-green-500/10 text-green-700", Seedling: "bg-blue-500/10 text-blue-700" };

export default function MyFarms() {
  const [farms, setFarms] = useState<Farm[]>(() => {
    const saved = localStorage.getItem("agri_farms");
    return saved ? JSON.parse(saved) : initialFarms;
  });
  
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newFarm, setNewFarm] = useState({ name: "", location: "", size: "", unit: "Acres", soilType: "", irrigation: "", image: "", crops: [] as Farm['crops'] });

  // State for adding a new crop (used in both farm form and detail view)
  const [newCrop, setNewCrop] = useState({ name: "", status: "Growing", plantedDate: "", expectedHarvest: "", health: "Healthy", image: "" });

  const farmFileInputRef = useRef<HTMLInputElement>(null);
  const cropFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("agri_farms", JSON.stringify(farms));
  }, [farms]);

  const totalArea = farms.reduce((sum, f) => sum + f.size, 0);
  const totalCrops = farms.reduce((sum, f) => sum + f.crops.length, 0);

  // Calculate Health Distribution for Pie Chart
  const healthStats = useMemo(() => {
    const stats = [
      { name: "Healthy", value: 0, color: "#22c55e" },
      { name: "Good", value: 0, color: "#3b82f6" },
      { name: "Needs Attention", value: 0, color: "#eab308" },
    ];
    farms.forEach(f => f.crops.forEach(c => {
      const stat = stats.find(s => s.name === c.health);
      if (stat) stat.value++;
    }));
    return stats.filter(s => s.value > 0);
  }, [farms]);

  const handleSaveFarm = () => {
    if (!newFarm.name || !newFarm.location) {
      toast.error("Farm name and location are required");
      return;
    }

    if (editingId) {
      setFarms(farms.map(f => f.id === editingId ? {
        ...f,
        name: newFarm.name,
        location: newFarm.location,
        size: parseFloat(newFarm.size) || 0,
        unit: newFarm.unit,
        soilType: newFarm.soilType,
        irrigation: newFarm.irrigation,
        image: newFarm.image,
        crops: newFarm.crops,
      } : f));
      toast.success("Farm updated successfully");
    } else {
      setFarms([...farms, {
        id: Date.now(), name: newFarm.name, location: newFarm.location, image: newFarm.image,
        size: parseFloat(newFarm.size) || 0, unit: newFarm.unit, soilType: newFarm.soilType, irrigation: newFarm.irrigation, crops: newFarm.crops,
      }]);
      toast.success("New farm added successfully");
    }

    setNewFarm({ name: "", location: "", size: "", unit: "Acres", soilType: "", irrigation: "", image: "", crops: [] });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (farm: Farm) => {
    setEditingId(farm.id);
    setNewFarm({
      name: farm.name,
      location: farm.location,
      size: farm.size.toString(),
      unit: farm.unit,
      soilType: farm.soilType,
      irrigation: farm.irrigation,
      image: farm.image || "",
      crops: [...farm.crops]
    });
    setIsFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'farm' | 'crop') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'farm') {
          setNewFarm(prev => ({ ...prev, image: reader.result as string }));
        } else {
          setNewCrop(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this farm profile? This action cannot be undone.")) {
      setFarms(farms.filter((f) => f.id !== id));
      if (selectedFarm?.id === id) setSelectedFarm(null);
      toast.success("Farm profile deleted");
    }
  };

  const handleAddCropToForm = () => {
    if (!newCrop.name.trim()) {
      toast.error("Crop name is required");
      return;
    }
    setNewFarm(prev => ({
      ...prev,
      crops: [...prev.crops, { ...newCrop }]
    }));
    setNewCrop({ name: "", status: "Growing", plantedDate: "", expectedHarvest: "", health: "Healthy", image: "" });
  };

  const handleRemoveCropFromForm = (index: number) => {
    setNewFarm(prev => ({
      ...prev,
      crops: prev.crops.filter((_, i) => i !== index)
    }));
  };

  const handleAddCropToExistingFarm = (farmId: number) => {
    if (!newCrop.name.trim()) {
      toast.error("Please enter a valid crop name");
      return;
    }
    setFarms(prev => prev.map(f => {
      if (f.id === farmId) {
        const updatedFarm = { ...f, crops: [...f.crops, { ...newCrop }] };
        setSelectedFarm(updatedFarm); // Update detail view
        return updatedFarm;
      }
      return f;
    }));
    setNewCrop({ name: "", status: "Growing", plantedDate: "", expectedHarvest: "", health: "Healthy", image: "" });
    toast.success("Crop added to farm");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Farms</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your farm profiles, crops, and field details</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingId(null);
            setNewFarm({ name: "", location: "", size: "", unit: "Acres", soilType: "", irrigation: "", image: "", crops: [] });
          }
        }}>
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />Add New Farm
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Farm Details" : "Add New Farm"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Farm Photo</Label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted cursor-pointer overflow-hidden"
                    onClick={() => farmFileInputRef.current?.click()}
                  >
                    {newFarm.image ? (
                      <img src={newFarm.image} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => farmFileInputRef.current?.click()}><Upload className="w-4 h-4" /> Upload Photo</Button>
                    <p className="text-[10px] text-muted-foreground">JPG or PNG. Max 2MB.</p>
                  </div>
                  <input type="file" ref={farmFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'farm')} />
                </div>
              </div>
              <div><Label>Farm Name</Label><Input placeholder="e.g. Green Valley Farm" value={newFarm.name} onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })} /></div>
              <div><Label>Location</Label><Input placeholder="e.g. Nashik, Maharashtra" value={newFarm.location} onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Size</Label><Input type="number" step="0.1" placeholder="5.5" value={newFarm.size} onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })} /></div>
                <div><Label>Unit</Label>
                  <Select value={newFarm.unit} onValueChange={(v) => setNewFarm({ ...newFarm, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Acres">Acres</SelectItem><SelectItem value="Hectares">Hectares</SelectItem><SelectItem value="Bigha">Bigha</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Soil Type</Label><Input placeholder="e.g. Black Cotton Soil" value={newFarm.soilType} onChange={(e) => setNewFarm({ ...newFarm, soilType: e.target.value })} /></div>
              <div><Label>Irrigation Type</Label><Input placeholder="e.g. Drip Irrigation" value={newFarm.irrigation} onChange={(e) => setNewFarm({ ...newFarm, irrigation: e.target.value })} /></div>
              
              <div className="pt-2 border-t border-border">
                <Label className="mb-2 block font-semibold">Active Crops</Label>
                <div className="space-y-2 mb-3">
                  {newFarm.crops.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded-lg text-sm">
                      <span>{c.name} ({c.status})</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveCropFromForm(idx)}><X className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Crop name" value={newCrop.name} onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })} />
                  <Select value={newCrop.status} onValueChange={(v) => setNewCrop({ ...newCrop, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Growing">Growing</SelectItem>
                      <SelectItem value="Harvesting">Harvesting</SelectItem>
                      <SelectItem value="Seedling">Seedling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full mt-2 gap-2 h-8 text-xs" onClick={handleAddCropToForm}>
                  <PlusCircle className="w-3 h-3" /> Add Crop to List
                </Button>
              </div>

              <Button className="w-full mt-2" onClick={handleSaveFarm}>{editingId ? "Save Changes" : "Create Farm Profile"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Farms", value: farms.length, icon: Wheat, color: "text-primary" },
            { label: "Total Area", value: `${totalArea.toFixed(1)} ${farms[0]?.unit || 'Acres'}`, icon: MapPin, color: "text-green-600" },
            { label: "Active Crops", value: totalCrops, icon: Sprout, color: "text-orange-600" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3 h-full">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                <div><p className="text-xs text-muted-foreground">{stat.label}</p><p className="text-lg font-bold text-foreground">{stat.value}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="p-3 pb-0 text-center"><CardTitle className="text-xs text-muted-foreground uppercase">Health Distribution</CardTitle></CardHeader>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthStats} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                  {healthStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Farm Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {farms.map((farm, i) => (
            <motion.div key={farm.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedFarm(farm)}>
                {farm.image && (
                  <div className="h-32 w-full overflow-hidden rounded-t-xl">
                    <img src={farm.image} className="w-full h-full object-cover" alt={farm.name} />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{farm.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{farm.location}</CardDescription>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" onClick={() => handleEdit(farm)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(farm.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Wheat className="w-3.5 h-3.5" /><span>{farm.size} {farm.unit}</span></div>
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Leaf className="w-3.5 h-3.5" /><span>{farm.soilType}</span></div>
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Droplets className="w-3.5 h-3.5" /><span>{farm.irrigation}</span></div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">ACTIVE CROPS</p>
                    <div className="space-y-2">
                      {farm.crops.map((crop) => (
                        <div key={crop.name} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{crop.name}</span>
                            <Badge className={`text-xs ${statusColor[crop.status] || ""}`} variant="secondary">{crop.status}</Badge>
                          </div>
                          <Badge className={`text-xs ${healthColor[crop.health] || ""}`} variant="secondary">{crop.health}</Badge>
                        </div>
                      ))}
                      {farm.crops.length === 0 && <p className="text-xs text-muted-foreground italic">No crops added yet</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Farm Detail Dialog */}
      <Dialog open={!!selectedFarm} onOpenChange={() => setSelectedFarm(null)}>
        <DialogContent className="max-w-lg">
          {selectedFarm && (
            <>
              <DialogHeader><DialogTitle>{selectedFarm.name}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-2">
                {selectedFarm.image && (
                  <div className="w-full h-48 rounded-xl overflow-hidden">
                    <img src={selectedFarm.image} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Location</span><p className="font-medium text-foreground">{selectedFarm.location}</p></div>
                  <div><span className="text-muted-foreground">Size</span><p className="font-medium text-foreground">{selectedFarm.size} {selectedFarm.unit}</p></div>
                  <div><span className="text-muted-foreground">Soil Type</span><p className="font-medium text-foreground">{selectedFarm.soilType}</p></div>
                  <div><span className="text-muted-foreground">Irrigation</span><p className="font-medium text-foreground">{selectedFarm.irrigation}</p></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Crop Details</p>
                  {selectedFarm.crops.map((crop) => (
                    <Card key={crop.name} className="mb-2">
                      <CardContent className="p-3 flex gap-3">
                        {crop.image && <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0"><img src={crop.image} className="w-full h-full object-cover" /></div>}
                        <div className="flex-1 space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">{crop.name}</span>
                          <Badge className={`${healthColor[crop.health] || ""}`} variant="secondary">{crop.health}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                          <span>Planted: {crop.plantedDate}</span>
                          <span>Harvest: {crop.expectedHarvest}</span>
                        </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-primary" /> Quick Add Crop
                  </p>
                  <div className="space-y-3 p-3 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-12 h-12 rounded-lg border border-dashed flex items-center justify-center bg-background cursor-pointer overflow-hidden"
                        onClick={() => cropFileInputRef.current?.click()}
                      >
                        {newCrop.image ? (
                          <img src={newCrop.image} className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => cropFileInputRef.current?.click()}>Upload Crop Image</Button>
                        <input type="file" ref={cropFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'crop')} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[10px]">Crop Name</Label><Input size={1} className="h-8 text-sm" placeholder="e.g. Maize" value={newCrop.name} onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })} /></div>
                      <div><Label className="text-[10px]">Health</Label>
                        <Select value={newCrop.health} onValueChange={(v) => setNewCrop({ ...newCrop, health: v })}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Healthy">Healthy</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Needs Attention">Needs Attention</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[10px]">Planted Date</Label><Input type="date" className="h-8 text-xs" value={newCrop.plantedDate} onChange={(e) => setNewCrop({ ...newCrop, plantedDate: e.target.value })} /></div>
                      <div><Label className="text-[10px]">Harvest Date</Label><Input type="date" className="h-8 text-xs" value={newCrop.expectedHarvest} onChange={(e) => setNewCrop({ ...newCrop, expectedHarvest: e.target.value })} /></div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={newCrop.status} onValueChange={(v) => setNewCrop({ ...newCrop, status: v })}>
                        <SelectTrigger className="h-8 text-sm flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Growing">Growing</SelectItem>
                          <SelectItem value="Harvesting">Harvesting</SelectItem>
                          <SelectItem value="Seedling">Seedling</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="h-8 text-xs px-4" onClick={() => handleAddCropToExistingFarm(selectedFarm.id)}>Add Crop</Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
