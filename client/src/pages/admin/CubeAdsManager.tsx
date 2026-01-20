/**
 * Cube Ads Manager - Admin Panel
 * 
 * Manage the 3D floating ad cubes that appear when sidebar collapses
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Trash2, Edit2, Eye, EyeOff, 
  BarChart3, MousePointer, Save, X,
  Palette, Link as LinkIcon, Type, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CubeAd {
  id: string;
  title: string;
  description: string | null;
  cta: string;
  link: string;
  gradient: string;
  icon: string | null;
  is_active: boolean;
  priority: number;
  start_date: string | null;
  end_date: string | null;
  click_count: number;
  impression_count: number;
  created_at: string;
}

// Predefined gradients for easy selection
const GRADIENT_PRESETS = [
  { name: "Cyan Empire", value: "from-cyan-600 via-blue-700 to-purple-800" },
  { name: "Emerald Shield", value: "from-emerald-600 via-teal-600 to-cyan-700" },
  { name: "Fire Defense", value: "from-red-600 via-orange-600 to-amber-600" },
  { name: "Royal Vault", value: "from-violet-600 via-purple-600 to-fuchsia-600" },
  { name: "Deep Analytics", value: "from-blue-600 via-indigo-600 to-violet-600" },
  { name: "Rose Network", value: "from-pink-600 via-rose-600 to-red-600" },
  { name: "Gold Premium", value: "from-amber-500 via-yellow-500 to-orange-500" },
  { name: "Matrix Green", value: "from-green-600 via-emerald-500 to-lime-500" },
];

// 3D Cube Preview Component
function CubePreview({ ad }: { ad: Partial<CubeAd> }) {
  const [rotation, setRotation] = useState({ x: -15, y: 25 });

  return (
    <div 
      className="relative w-24 h-24 mx-auto"
      style={{ perspective: "500px" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientY - rect.top - rect.height / 2) / 5;
        const y = (e.clientX - rect.left - rect.width / 2) / 5;
        setRotation({ x: -x, y });
      }}
      onMouseLeave={() => setRotation({ x: -15, y: 25 })}
    >
      <motion.div
        animate={{ rotateX: rotation.x, rotateY: rotation.y }}
        transition={{ type: "spring", stiffness: 100 }}
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front face */}
        <div
          className="absolute w-24 h-24 flex flex-col items-center justify-center p-2 rounded-lg border border-white/30"
          style={{
            transform: "translateZ(48px)",
            backfaceVisibility: "hidden",
            background: `linear-gradient(135deg, ${ad.gradient?.replace('from-', '').split(' ')[0] || '#06b6d4'}, ${ad.gradient?.includes('to-') ? ad.gradient.split('to-')[1] : '#8b5cf6'})`,
          }}
        >
          <span className="text-[8px] text-white/40 uppercase tracking-wider absolute top-1 left-2">Ad</span>
          <div className="text-center mt-2">
            <h4 className="text-xs font-bold text-white leading-tight mb-1">
              {ad.title || "TITLE"}
            </h4>
            <p className="text-[8px] text-white/70">
              {ad.cta || "CTA"}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/30 blur-md rounded-full" />
    </div>
  );
}

// Ad Form Dialog
function AdFormDialog({
  ad,
  isOpen,
  onClose,
  onSave,
}: {
  ad: Partial<CubeAd> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ad: Partial<CubeAd>) => void;
}) {
  const [formData, setFormData] = useState<Partial<CubeAd>>({
    title: "",
    description: "",
    cta: "",
    link: "",
    gradient: GRADIENT_PRESETS[0].value,
    priority: 50,
    is_active: true,
  });

  useEffect(() => {
    if (ad) {
      setFormData(ad);
    } else {
      setFormData({
        title: "",
        description: "",
        cta: "",
        link: "",
        gradient: GRADIENT_PRESETS[0].value,
        priority: 50,
        is_active: true,
      });
    }
  }, [ad, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            {ad?.id ? "Edit Cube Ad" : "Create New Cube Ad"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Title</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="FANZ EMPIRE"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Input
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Command your digital dynasty"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-300">CTA Button</Label>
                <Input
                  value={formData.cta || ""}
                  onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                  placeholder="Enter"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Priority (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.priority || 0}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Link URL</Label>
              <Input
                value={formData.link || ""}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/empire"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Gradient Preset</Label>
              <div className="grid grid-cols-4 gap-2">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setFormData({ ...formData, gradient: preset.value })}
                    className={cn(
                      "h-8 rounded-md border-2 transition-all",
                      formData.gradient === preset.value 
                        ? "border-white scale-105" 
                        : "border-transparent hover:border-gray-500"
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${preset.value.replace('from-', '').split(' ')[0]}, ${preset.value.split('to-')[1]})`,
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col items-center justify-center bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-4">LIVE PREVIEW</p>
            <CubePreview ad={formData} />
            <p className="text-gray-500 text-xs mt-4">Hover to rotate</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(formData)}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {ad?.id ? "Update Ad" : "Create Ad"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CubeAdsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingAd, setEditingAd] = useState<Partial<CubeAd> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch all ads
  const { data: adsData, isLoading } = useQuery({
    queryKey: ["cube-ads-all"],
    queryFn: async () => {
      const res = await fetch("/api/cube-ads/all");
      if (!res.ok) throw new Error("Failed to fetch ads");
      return res.json();
    },
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["cube-ads-stats"],
    queryFn: async () => {
      const res = await fetch("/api/cube-ads/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (ad: Partial<CubeAd>) => {
      const url = ad.id ? `/api/cube-ads/${ad.id}` : "/api/cube-ads";
      const method = ad.id ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ad),
      });
      
      if (!res.ok) throw new Error("Failed to save ad");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cube-ads-all"] });
      queryClient.invalidateQueries({ queryKey: ["cube-ads-stats"] });
      toast({ title: "Success", description: "Ad saved successfully" });
      setIsFormOpen(false);
      setEditingAd(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save ad", variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cube-ads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete ad");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cube-ads-all"] });
      queryClient.invalidateQueries({ queryKey: ["cube-ads-stats"] });
      toast({ title: "Deleted", description: "Ad removed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete ad", variant: "destructive" });
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const res = await fetch(`/api/cube-ads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      });
      if (!res.ok) throw new Error("Failed to toggle ad");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cube-ads-all"] });
    },
  });

  const ads: CubeAd[] = adsData?.ads || [];
  const stats = statsData?.stats || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            Floating Cube Ads
          </h1>
          <p className="text-gray-400 mt-1">
            Manage the 3D rotating ad cubes that appear when sidebar collapses
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingAd(null);
            setIsFormOpen(true);
          }}
          className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Cube Ad
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Ads</p>
                <p className="text-2xl font-bold text-white">{stats.total_ads || 0}</p>
              </div>
              <Sparkles className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-400">{stats.active_ads || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Clicks</p>
                <p className="text-2xl font-bold text-white">{stats.total_clicks || 0}</p>
              </div>
              <MousePointer className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">CTR</p>
                <p className="text-2xl font-bold text-white">{stats.avg_ctr || 0}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-amber-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ads Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading ads...</div>
      ) : ads.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No cube ads yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {ads.map((ad) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className={cn(
                  "bg-gray-800/50 border-gray-700 overflow-hidden",
                  !ad.is_active && "opacity-60"
                )}>
                  <div 
                    className="h-2" 
                    style={{
                      background: `linear-gradient(90deg, ${ad.gradient.replace('from-', '').split(' ')[0]}, ${ad.gradient.split('to-')[1]})`,
                    }}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{ad.title}</h3>
                        <p className="text-gray-400 text-sm">{ad.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleMutation.mutate({ id: ad.id, is_active: !ad.is_active })}
                          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                          title={ad.is_active ? "Deactivate" : "Activate"}
                        >
                          {ad.is_active ? (
                            <Eye className="w-4 h-4 text-green-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingAd(ad);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this ad?")) {
                              deleteMutation.mutate(ad.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-900/50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-gray-700/50 rounded p-2">
                        <p className="text-gray-400">CTA</p>
                        <p className="text-white font-medium">{ad.cta}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded p-2">
                        <p className="text-gray-400">Clicks</p>
                        <p className="text-white font-medium">{ad.click_count}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded p-2">
                        <p className="text-gray-400">Priority</p>
                        <p className="text-white font-medium">{ad.priority}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        {ad.link}
                      </span>
                      <span>{ad.impression_count} impressions</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Dialog */}
      <AdFormDialog
        ad={editingAd}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAd(null);
        }}
        onSave={(ad) => saveMutation.mutate(ad)}
      />
    </div>
  );
}
