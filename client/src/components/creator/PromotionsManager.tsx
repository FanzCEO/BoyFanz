import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Percent, DollarSign, Gift, Tag, Copy, Trash2, Plus, TrendingUp, Users, Clock, Pause, Play, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Promotion {
  id: number;
  name: string;
  description?: string;
  type: "percentage" | "fixed_amount" | "trial_days" | "bundle_discount";
  value: number;
  trialDays?: number;
  bundleMonths?: number;
  maxRedemptions?: number;
  redemptionCount: number;
  startsAt: string;
  endsAt?: string;
  status: string;
  isPublic: boolean;
  newSubscribersOnly: boolean;
}

interface Coupon {
  id: number;
  code: string;
  name: string;
  type: string;
  value: number;
  trialDays?: number;
  bundleMonths?: number;
  maxRedemptions?: number;
  redemptionCount: number;
  expiresAt?: string;
  status: string;
  newSubscribersOnly: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    paused: "bg-yellow-500/20 text-yellow-400",
    expired: "bg-zinc-500/20 text-zinc-400",
  };
  return <Badge className={colors[status] || "bg-zinc-700"}>{status}</Badge>;
}

function formatValue(type: string, value: number): string {
  if (type === "percentage") return `${value}% off`;
  if (type === "fixed_amount") return `$${(value / 100).toFixed(2)} off`;
  if (type === "trial_days") return `${value} day trial`;
  return `${value}% bundle`;
}

export function PromotionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("promotions");
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<"promotion" | "coupon">("promotion");

  const { data: promotions = [] } = useQuery<Promotion[]>({ queryKey: ["/api/creator/promotions"] });
  const { data: coupons = [] } = useQuery<Coupon[]>({ queryKey: ["/api/creator/coupons"] });
  const { data: analytics } = useQuery({ queryKey: ["/api/creator/discount-analytics"] });

  const createPromo = useMutation({
    mutationFn: (data: any) => apiRequest("/api/creator/promotions", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/creator/promotions"] }); setCreateOpen(false); toast({ title: "Promotion created!" }); },
  });

  const createCoupon = useMutation({
    mutationFn: (data: any) => apiRequest("/api/creator/coupons", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/creator/coupons"] }); setCreateOpen(false); toast({ title: "Coupon created!" }); },
  });

  const updatePromo = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/creator/promotions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/creator/promotions"] }),
  });

  const updateCoupon = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/creator/coupons/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/creator/coupons"] }),
  });

  const deletePromo = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/creator/promotions/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/creator/promotions"] }),
  });

  const deleteCoupon = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/creator/coupons/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/creator/coupons"] }),
  });

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "Copied!" }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-zinc-400">Active Promotions</p><p className="text-2xl font-bold">{promotions.filter(p => p.status === "active").length}</p></div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-zinc-400">Active Coupons</p><p className="text-2xl font-bold">{coupons.filter(c => c.status === "active").length}</p></div>
              <Tag className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-zinc-400">Redemptions</p><p className="text-2xl font-bold">{promotions.reduce((a, p) => a + p.redemptionCount, 0) + coupons.reduce((a, c) => a + c.redemptionCount, 0)}</p></div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-zinc-400">Revenue</p><p className="text-2xl font-bold">${((analytics?.promotions?.totalRevenue || 0) + (analytics?.coupons?.totalRevenue || 0)) / 100}</p></div>
              <BarChart3 className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-zinc-800"><TabsTrigger value="promotions">Promotions</TabsTrigger><TabsTrigger value="coupons">Coupons</TabsTrigger></TabsList>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button onClick={() => setCreateType(activeTab === "coupons" ? "coupon" : "promotion")}><Plus className="h-4 w-4 mr-2" />Create</Button></DialogTrigger>
            <CreateDialog type={createType} onSubmit={(d) => createType === "coupon" ? createCoupon.mutate(d) : createPromo.mutate(d)} loading={createPromo.isPending || createCoupon.isPending} />
          </Dialog>
        </div>
        <TabsContent value="promotions" className="mt-4 space-y-4">
          {promotions.length === 0 ? <EmptyState type="promotion" onCreate={() => { setCreateType("promotion"); setCreateOpen(true); }} /> : promotions.map(p => (
            <PromoCard key={p.id} promo={p} onToggle={() => updatePromo.mutate({ id: p.id, status: p.status === "active" ? "paused" : "active" })} onDelete={() => deletePromo.mutate(p.id)} />
          ))}
        </TabsContent>
        <TabsContent value="coupons" className="mt-4 space-y-4">
          {coupons.length === 0 ? <EmptyState type="coupon" onCreate={() => { setCreateType("coupon"); setCreateOpen(true); }} /> : coupons.map(c => (
            <CouponCard key={c.id} coupon={c} onCopy={() => copy(c.code)} onToggle={() => updateCoupon.mutate({ id: c.id, status: c.status === "active" ? "paused" : "active" })} onDelete={() => deleteCoupon.mutate(c.id)} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ type, onCreate }: { type: string; onCreate: () => void }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="py-12 text-center">
        {type === "coupon" ? <Tag className="h-12 w-12 mx-auto text-zinc-600 mb-4" /> : <Percent className="h-12 w-12 mx-auto text-zinc-600 mb-4" />}
        <h3 className="text-lg font-semibold mb-2">No {type}s yet</h3>
        <p className="text-zinc-400 mb-4">Create {type}s to attract subscribers</p>
        <Button onClick={onCreate}><Plus className="h-4 w-4 mr-2" />Create {type}</Button>
      </CardContent>
    </Card>
  );
}

function PromoCard({ promo, onToggle, onDelete }: { promo: Promotion; onToggle: () => void; onDelete: () => void }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2"><h3 className="font-semibold">{promo.name}</h3><StatusBadge status={promo.status} /></div>
            <p className="text-sm text-zinc-400">{formatValue(promo.type, promo.value)} {promo.newSubscribersOnly && "• New only"}</p>
            <p className="text-xs text-zinc-500">{promo.redemptionCount} redemptions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onToggle}>{promo.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CouponCard({ coupon, onCopy, onToggle, onDelete }: { coupon: Coupon; onCopy: () => void; onToggle: () => void; onDelete: () => void }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-slate-500/20"><Tag className="h-5 w-5 text-blue-400" /></div>
          <div>
            <div className="flex items-center gap-2"><h3 className="font-semibold">{coupon.name}</h3><StatusBadge status={coupon.status} /></div>
            <div className="flex items-center gap-2 mt-1">
              <code className="px-2 py-1 bg-zinc-800 rounded text-sm font-mono text-amber-400">{coupon.code}</code>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCopy}><Copy className="h-3 w-3" /></Button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">{coupon.redemptionCount} redemptions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onToggle}>{coupon.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateDialog({ type, onSubmit, loading }: { type: "promotion" | "coupon"; onSubmit: (d: any) => void; loading: boolean }) {
  const [form, setForm] = useState({ name: "", type: "percentage", value: 10, startsAt: new Date().toISOString().split("T")[0], newSubscribersOnly: false, customCode: "" });
  
  return (
    <DialogContent className="max-w-md bg-zinc-900 border-zinc-800">
      <DialogHeader><DialogTitle>Create {type}</DialogTitle></DialogHeader>
      <div className="space-y-4 py-4">
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-zinc-800 border-zinc-700" /></div>
        {type === "coupon" && <div><Label>Code (optional)</Label><Input value={form.customCode} onChange={e => setForm({ ...form, customCode: e.target.value.toUpperCase() })} className="bg-zinc-800 border-zinc-700 font-mono" maxLength={20} /></div>}
        <div>
          <Label>Type</Label>
          <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage Off</SelectItem>
              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
              <SelectItem value="trial_days">Trial Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Value</Label><Input type="number" value={form.value} onChange={e => setForm({ ...form, value: parseInt(e.target.value) || 0 })} className="bg-zinc-800 border-zinc-700" /></div>
        <div><Label>Start Date</Label><Input type="date" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} className="bg-zinc-800 border-zinc-700" /></div>
        <div className="flex items-center justify-between"><Label>New subscribers only</Label><Switch checked={form.newSubscribersOnly} onCheckedChange={v => setForm({ ...form, newSubscribersOnly: v })} /></div>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit({ ...form, value: form.type === "fixed_amount" ? form.value * 100 : form.value })} disabled={!form.name || loading} className="bg-red-500 hover:bg-red-600">
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default PromotionsManager;
