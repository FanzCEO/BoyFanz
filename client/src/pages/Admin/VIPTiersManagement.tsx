import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Crown, Star, Gem, Trophy, Search, MoreHorizontal,
  CheckCircle, XCircle, Eye, TrendingUp, BarChart3, Clock, RefreshCw,
  Zap, Percent, Users, Plus, Settings, Sparkles, Shield,
  Gift, DollarSign, Heart, Award
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface VIPTier {
  id: string;
  creatorId: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly';
  perks: string[];
  isActive: boolean;
  subscriberCount: number;
  totalRevenue: number;
  createdAt: string;
  creator?: {
    username: string;
    displayName: string;
  };
}

interface VIPSubscription {
  id: string;
  tierId: string;
  subscriberId: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  subscriber?: {
    username: string;
    displayName: string;
  };
  tier?: VIPTier;
}

export default function VIPTiersManagement() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('tiers');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showTierDialog, setShowTierDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState<VIPTier | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const defaultPerks = [
    "Exclusive content access",
    "Priority DM responses",
    "Custom badge",
    "Early access to new content"
  ];

  const [newTier, setNewTier] = useState({
    name: '',
    tier: 'bronze' as const,
    price: 9.99,
    billingPeriod: 'monthly' as const,
    perks: defaultPerks,
    isActive: true
  });

  // Fetch all VIP tiers
  const { data: tiersData, isLoading: tiersLoading, refetch: refetchTiers } = useQuery({
    queryKey: ['/api/vip-tiers/admin', { searchQuery, tier: tierFilter, status: statusFilter, page: currentPage, limit: pageSize }],
    enabled: user?.role === 'admin' || user?.role === 'moderator'
  });

  // Fetch subscriptions
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['/api/vip-tiers/admin/subscriptions', { page: currentPage, limit: pageSize }],
    enabled: (user?.role === 'admin' || user?.role === 'moderator') && activeTab === 'subscriptions'
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/vip-tiers/admin/analytics'],
    enabled: user?.role === 'admin' || user?.role === 'moderator'
  });

  // Create tier mutation
  const createTierMutation = useMutation({
    mutationFn: async (tierData: typeof newTier) => {
      return await apiRequest('/api/vip-tiers', {
        method: 'POST',
        body: JSON.stringify(tierData)
      });
    },
    onSuccess: () => {
      toast({ title: "VIP tier created successfully" });
      setShowTierDialog(false);
      setIsCreating(false);
      resetNewTier();
      refetchTiers();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create tier", description: error.message, variant: "destructive" });
    }
  });

  // Update tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VIPTier> }) => {
      return await apiRequest(`/api/vip-tiers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: "VIP tier updated successfully" });
      setShowTierDialog(false);
      setSelectedTier(null);
      refetchTiers();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update tier", description: error.message, variant: "destructive" });
    }
  });

  // Toggle tier status
  const toggleTierMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest(`/api/vip-tiers/${id}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ isActive })
      });
    },
    onSuccess: () => {
      toast({ title: "Tier status updated" });
      refetchTiers();
    }
  });

  const resetNewTier = () => {
    setNewTier({
      name: '',
      tier: 'bronze',
      price: 9.99,
      billingPeriod: 'monthly',
      perks: defaultPerks,
      isActive: true
    });
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="h-5 w-5 text-amber-700" />;
      case 'silver': return <Star className="h-5 w-5 text-gray-400" />;
      case 'gold': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'diamond': return <Gem className="h-5 w-5 text-cyan-400" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-700/10 text-amber-700 border-amber-700/20';
      case 'silver': return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
      case 'gold': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'diamond': return 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const addPerk = () => {
    setNewTier(prev => ({
      ...prev,
      perks: [...prev.perks, '']
    }));
  };

  const updatePerk = (index: number, value: string) => {
    setNewTier(prev => ({
      ...prev,
      perks: prev.perks.map((p, i) => i === index ? value : p)
    }));
  };

  const removePerk = (index: number) => {
    setNewTier(prev => ({
      ...prev,
      perks: prev.perks.filter((_, i) => i !== index)
    }));
  };

  const tiers = tiersData?.tiers || [];
  const subscriptions = subscriptionsData?.subscriptions || [];
  const analytics = analyticsData || { totalTiers: 0, totalSubscribers: 0, totalRevenue: 0, mrr: 0 };

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8">
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription>You don't have permission to view this page.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            VIP Tiers Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage Bronze, Silver, Gold & Diamond subscription tiers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchTiers()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { setIsCreating(true); setShowTierDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tiers</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTiers}</div>
            <p className="text-xs text-muted-foreground">VIP tier configs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSubscribers?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Active VIP members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics.totalRevenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics.mrr || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Monthly recurring</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Icons Legend */}
      <div className="flex gap-4 justify-center">
        {['bronze', 'silver', 'gold', 'diamond'].map((tier) => (
          <div key={tier} className={cn("flex items-center gap-2 px-4 py-2 rounded-full border", getTierColor(tier))}>
            {getTierIcon(tier)}
            <span className="font-medium capitalize">{tier}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tiers" className="gap-2">
            <Crown className="h-4 w-4" />
            Tiers
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <Users className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tiers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tier Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {tiersLoading ? (
                <div className="text-center py-12">Loading tiers...</div>
              ) : tiers.length === 0 ? (
                <div className="text-center py-12">
                  <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No VIP tiers found</h3>
                  <p className="text-muted-foreground">Create a new VIP tier to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiers.map((tier: VIPTier) => (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getTierIcon(tier.tier)}
                            {tier.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tier.creator?.displayName || tier.creator?.username || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize", getTierColor(tier.tier))}>
                            {tier.tier}
                          </Badge>
                        </TableCell>
                        <TableCell>${tier.price}</TableCell>
                        <TableCell className="capitalize">{tier.billingPeriod}</TableCell>
                        <TableCell>{tier.subscriberCount?.toLocaleString() || 0}</TableCell>
                        <TableCell>${(tier.totalRevenue || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={tier.isActive}
                            onCheckedChange={(checked) =>
                              toggleTierMutation.mutate({ id: tier.id, isActive: checked })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTier(tier);
                              setIsCreating(false);
                              setNewTier({
                                name: tier.name,
                                tier: tier.tier,
                                price: tier.price,
                                billingPeriod: tier.billingPeriod,
                                perks: tier.perks || defaultPerks,
                                isActive: tier.isActive
                              });
                              setShowTierDialog(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>View all VIP subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="text-center py-12">Loading subscriptions...</div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No subscriptions yet</h3>
                  <p className="text-muted-foreground">Subscriptions will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscriber</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Auto Renew</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub: VIPSubscription) => (
                      <TableRow key={sub.id}>
                        <TableCell>{sub.subscriber?.displayName || sub.subscriber?.username}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {sub.tier && getTierIcon(sub.tier.tier)}
                            {sub.tier?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(sub.startDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{format(new Date(sub.endDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          {sub.autoRenew ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Performing Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analyticsData?.topTiers || []).map((tier: any, index: number) => (
                    <div key={tier.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTierIcon(tier.tier)}
                        <span className="font-medium">{tier.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-green-500 font-semibold">${tier.revenue.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{tier.subscribers} subscribers</div>
                      </div>
                    </div>
                  ))}
                  {(!analyticsData?.topTiers || analyticsData.topTiers.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Tier Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['diamond', 'gold', 'silver', 'bronze'].map((tierLevel) => {
                    const tierData = analyticsData?.tierDistribution?.[tierLevel] || { count: 0, percentage: 0 };
                    return (
                      <div key={tierLevel} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTierIcon(tierLevel)}
                            <span className="capitalize font-medium">{tierLevel}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{tierData.count} ({tierData.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", getTierColor(tierLevel).split(' ')[0])}
                            style={{ width: `${tierData.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Tier Dialog */}
      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create VIP Tier' : 'Edit VIP Tier'}
            </DialogTitle>
            <DialogDescription>
              Configure tier settings and perks
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tier Name</label>
                <Input
                  value={newTier.name}
                  onChange={(e) => setNewTier(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Ultimate Fan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tier Level</label>
                <Select
                  value={newTier.tier}
                  onValueChange={(v: any) => setNewTier(prev => ({ ...prev, tier: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  min="0.99"
                  step="0.01"
                  value={newTier.price}
                  onChange={(e) => setNewTier(prev => ({ ...prev, price: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Billing Period</label>
                <Select
                  value={newTier.billingPeriod}
                  onValueChange={(v: any) => setNewTier(prev => ({ ...prev, billingPeriod: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={newTier.isActive}
                onCheckedChange={(checked) => setNewTier(prev => ({ ...prev, isActive: checked }))}
              />
              <label className="text-sm font-medium">Active</label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Perks & Benefits</label>
                <Button type="button" variant="outline" size="sm" onClick={addPerk}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Perk
                </Button>
              </div>

              {newTier.perks.map((perk, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g., Exclusive behind-the-scenes content"
                    value={perk}
                    onChange={(e) => updatePerk(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePerk(index)}
                    className="text-destructive"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {newTier.perks.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Gift className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No perks added yet</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowTierDialog(false); resetNewTier(); }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (isCreating) {
                  createTierMutation.mutate(newTier);
                } else if (selectedTier) {
                  updateTierMutation.mutate({ id: selectedTier.id, data: newTier });
                }
              }}
              disabled={createTierMutation.isPending || updateTierMutation.isPending}
            >
              {(createTierMutation.isPending || updateTierMutation.isPending) ? 'Saving...' :
               isCreating ? 'Create Tier' : 'Update Tier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
