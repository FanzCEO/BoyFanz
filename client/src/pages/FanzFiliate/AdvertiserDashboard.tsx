// @ts-nocheck
/**
 * FanzFiliate Advertiser Dashboard
 *
 * Self-serve advertising platform for the Fanz ecosystem.
 * Advertisers can create campaigns, upload creatives, set budgets,
 * and target across all Fanz platforms.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus,
  BarChart3,
  Target,
  DollarSign,
  Eye,
  MousePointer,
  TrendingUp,
  Pause,
  Play,
  Settings,
  Upload,
  Globe,
  Monitor,
  Smartphone,
  Clock,
  ArrowUpRight,
  Megaphone,
} from "lucide-react";
import { useLocation } from "wouter";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  budgetCents: number;
  dailyBudgetCents: number;
  spentCents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}

export default function AdvertiserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'content_promotion',
    budgetCents: 5000, // $50 default
    dailyBudgetCents: 500, // $5/day default
    targeting: {
      platforms: [] as string[],
      geoTargets: [] as string[],
      deviceTypes: [] as string[],
    },
  });

  // Fetch dashboard data
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['/api/fanzfiliate/dashboard'],
  });

  // Fetch campaigns
  const { data: campaignsData } = useQuery({
    queryKey: ['/api/fanzfiliate/campaigns'],
  });

  // Fetch targeting options
  const { data: targetingOptions } = useQuery({
    queryKey: ['/api/fanzfiliate/targeting-options'],
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/fanzfiliate/campaigns', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fanzfiliate/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fanzfiliate/dashboard'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Campaign created",
        description: "Your campaign has been created as a draft. Add creatives to launch it.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  // Update campaign status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('POST', `/api/fanzfiliate/campaigns/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fanzfiliate/campaigns'] });
      toast({
        title: "Campaign updated",
        description: "Campaign status has been updated.",
      });
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const stats = dashboard?.stats || {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpentCents: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    avgCTR: 0,
    avgCPC: 0,
  };

  const campaigns = campaignsData?.campaigns || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            FanzFiliate Ads
          </h1>
          <p className="text-muted-foreground">
            Advertise across all Fanz platforms
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Set up your advertising campaign to reach audiences across the Fanz ecosystem.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Awesome Campaign"
                />
              </div>

              {/* Campaign Type */}
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select
                  value={newCampaign.type}
                  onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content_promotion">Content Promotion</SelectItem>
                    <SelectItem value="profile_promotion">Profile Promotion</SelectItem>
                    <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                    <SelectItem value="cross_platform">Cross-Platform</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      type="number"
                      min="10"
                      value={newCampaign.budgetCents / 100}
                      onChange={(e) => setNewCampaign(prev => ({
                        ...prev,
                        budgetCents: Number(e.target.value) * 100
                      }))}
                      className="pl-9"
                      placeholder="50.00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum $10</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyBudget">Daily Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dailyBudget"
                      type="number"
                      min="5"
                      value={newCampaign.dailyBudgetCents / 100}
                      onChange={(e) => setNewCampaign(prev => ({
                        ...prev,
                        dailyBudgetCents: Number(e.target.value) * 100
                      }))}
                      className="pl-9"
                      placeholder="5.00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum $5/day</p>
                </div>
              </div>

              {/* Platform Targeting */}
              <div className="space-y-2">
                <Label>Target Platforms</Label>
                <div className="grid grid-cols-2 gap-2">
                  {targetingOptions?.platforms?.map((platform: any) => (
                    <div
                      key={platform.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        newCampaign.targeting.platforms.includes(platform.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        const platforms = newCampaign.targeting.platforms.includes(platform.id)
                          ? newCampaign.targeting.platforms.filter(p => p !== platform.id)
                          : [...newCampaign.targeting.platforms, platform.id];
                        setNewCampaign(prev => ({
                          ...prev,
                          targeting: { ...prev.targeting, platforms }
                        }));
                      }}
                    >
                      <span className="text-xl">{platform.icon}</span>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground col-span-2">Loading platforms...</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to target all platforms
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createCampaignMutation.mutate(newCampaign)}
                disabled={!newCampaign.name || createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSpentCents)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalImpressions)}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalClicks)}</p>
              </div>
              <MousePointer className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CTR</p>
                <p className="text-2xl font-bold">{stats.avgCTR.toFixed(2)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.activeCampaigns})</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {campaigns.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-md">
                  Create your first advertising campaign to reach audiences across all Fanz platforms.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign: Campaign) => (
                <Card key={campaign.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {campaign.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Budget Progress */}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Budget</p>
                          <p className="font-medium">
                            {formatCurrency(campaign.spentCents)} / {formatCurrency(campaign.budgetCents)}
                          </p>
                          <Progress
                            value={(campaign.spentCents / campaign.budgetCents) * 100}
                            className="h-1 w-24 mt-1"
                          />
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 text-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Impressions</p>
                            <p className="font-medium">{formatNumber(campaign.impressions)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Clicks</p>
                            <p className="font-medium">{formatNumber(campaign.clicks)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">CTR</p>
                            <p className="font-medium">
                              {campaign.impressions > 0
                                ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
                                : 0}%
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {campaign.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({
                                id: campaign.id,
                                status: 'paused'
                              })}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : campaign.status === 'paused' || campaign.status === 'draft' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({
                                id: campaign.id,
                                status: 'active'
                              })}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          ) : null}
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <p className="text-muted-foreground">Active campaigns will appear here.</p>
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          <p className="text-muted-foreground">Draft campaigns will appear here.</p>
        </TabsContent>

        <TabsContent value="paused" className="mt-6">
          <p className="text-muted-foreground">Paused campaigns will appear here.</p>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="hover:border-primary/30 transition-colors cursor-pointer"
          onClick={() => navigate('/help/wiki/advertising-targeting-guide')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Targeting Guide</h3>
              <p className="text-sm text-muted-foreground">Learn how to reach your ideal audience</p>
            </div>
            <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>

        <Card
          className="hover:border-primary/30 transition-colors cursor-pointer"
          onClick={() => navigate('/help/wiki/creative-specs')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Upload className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Creative Specs</h3>
              <p className="text-sm text-muted-foreground">Ad dimensions and requirements</p>
            </div>
            <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>

        <Card
          className="hover:border-primary/30 transition-colors cursor-pointer"
          onClick={() => navigate('/fanz-money-center')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Billing & Payments</h3>
              <p className="text-sm text-muted-foreground">Manage your ad spend</p>
            </div>
            <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
