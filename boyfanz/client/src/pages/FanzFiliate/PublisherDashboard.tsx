// @ts-nocheck
/**
 * FanzFiliate Publisher Dashboard
 *
 * For creators who want to earn additional revenue by
 * displaying ads on their profile/content.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DollarSign,
  Eye,
  MousePointer,
  TrendingUp,
  Plus,
  Copy,
  Settings,
  ArrowUpRight,
  Wallet,
  BarChart3,
  Code,
  Check,
  Info,
  Heart,
  PawPrint,
} from "lucide-react";

export default function PublisherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [charityDonationPercent, setCharityDonationPercent] = useState(0);
  const [isCharityDialogOpen, setIsCharityDialogOpen] = useState(false);

  // Fetch publisher dashboard data
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['/api/fanzfiliate/publisher/dashboard'],
  });

  // Fetch placements
  const { data: placementsData } = useQuery({
    queryKey: ['/api/fanzfiliate/publisher/placements'],
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const earnings = dashboard?.earnings || {
    totalCents: 0,
    pendingCents: 0,
    paidOutCents: 0,
    thisMonthCents: 0,
  };

  const stats = dashboard?.stats || {
    totalImpressions: 0,
    totalClicks: 0,
    avgRPM: 0,
    fillRate: 0,
  };

  const placements = placementsData?.placements || [];

  // Sample embed code
  const getEmbedCode = (placementId: string, format: string) => {
    return `<!-- FanzFiliate Ad - ${format} -->
<div id="fanzfiliate-${placementId}"></div>
<script>
  (function() {
    var s = document.createElement('script');
    s.src = 'https://ads.fanz.com/sdk.js';
    s.async = true;
    s.onload = function() {
      FanzAds.render({
        placement: '${placementId}',
        format: '${format}',
        container: 'fanzfiliate-${placementId}'
      });
    };
    document.head.appendChild(s);
  })();
</script>`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <Wallet className="h-8 w-8 text-green-500" />
            Publisher Earnings
          </h1>
          <p className="text-muted-foreground">
            Earn money by displaying ads on your content
          </p>
        </div>
        <Button variant="outline">
          <DollarSign className="h-4 w-4 mr-2" />
          Request Payout
        </Button>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(earnings.thisMonthCents)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{formatCurrency(earnings.pendingCents)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(earnings.totalCents)}</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RPM</p>
                <p className="text-2xl font-bold">${stats.avgRPM.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
          <CardDescription>Your ad performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Impressions</p>
              <p className="text-2xl font-bold">{formatNumber(stats.totalImpressions)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Clicks</p>
              <p className="text-2xl font-bold">{formatNumber(stats.totalClicks)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">CTR</p>
              <p className="text-2xl font-bold">
                {stats.totalImpressions > 0
                  ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fill Rate</p>
              <p className="text-2xl font-bold">{stats.fillRate.toFixed(0)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Placements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ad Placements</CardTitle>
              <CardDescription>
                Manage where ads appear on your content
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Placement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Ad Placement</DialogTitle>
                  <DialogDescription>
                    Define where you want to show ads on your content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Placement Name</Label>
                    <Input placeholder="e.g., Profile Sidebar" />
                  </div>
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select defaultValue="native">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="native">Native (Recommended)</SelectItem>
                        <SelectItem value="banner">Banner (728x90)</SelectItem>
                        <SelectItem value="rectangle">Rectangle (300x250)</SelectItem>
                        <SelectItem value="sidebar">Sidebar (160x600)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum CPM ($)</Label>
                    <Input type="number" defaultValue="1.00" min="0.50" step="0.10" />
                    <p className="text-xs text-muted-foreground">
                      Set a floor price for ads shown in this placement
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Create Placement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {placements.length === 0 ? (
            <div className="text-center py-8">
              <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No placements yet</h3>
              <p className="text-muted-foreground mb-4">
                Create ad placements to start earning from ads on your content.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Placement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {placements.map((placement: any) => (
                <div
                  key={placement.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{placement.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {placement.type} • ${placement.cpmFloorCents / 100} CPM floor
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={placement.isActive} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(getEmbedCode(placement.id, placement.type), placement.id)}
                    >
                      {copiedCode === placement.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Integration Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">1. Automatic Integration (Recommended)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Ads are automatically shown on your BoyFanz profile and content.
              Just enable placements above.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">2. External Sites</h4>
            <p className="text-sm text-muted-foreground mb-2">
              To show ads on your external website or link-in-bio page, copy the embed code from your placements.
            </p>
            <pre className="bg-black/50 p-3 rounded text-xs overflow-x-auto">
{`<script src="https://ads.fanz.com/sdk.js" async></script>
<div data-fanzads="YOUR_PLACEMENT_ID"></div>`}
            </pre>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">3. Revenue Share</h4>
            <p className="text-sm text-muted-foreground">
              You earn <span className="text-green-400 font-semibold">70%</span> of all ad revenue.
              Payouts are processed weekly for balances over $50.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500/10 to-amber-500/10 rounded-lg border border-pink-500/20">
            <div className="flex items-center gap-2 mb-2">
              <PawPrint className="h-5 w-5 text-pink-400" />
              <h4 className="font-medium text-pink-400">The Wittle Bear Foundation</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-pink-400 font-semibold">100% of platform's 30%</span> goes directly to
              The Wittle Bear Foundation, supporting <span className="text-pink-400">homeless LGBTQ+ youth</span> and
              <span className="text-pink-400"> animals in shelters</span>.
              You can also donate a portion of your earnings below.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* The Wittle Bear Foundation - Charity Donation */}
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-amber-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-pink-500/20">
                <PawPrint className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  The Wittle Bear Foundation
                  <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                </CardTitle>
                <CardDescription>
                  In loving memory of Wittle Bear
                </CardDescription>
              </div>
            </div>
            <Dialog open={isCharityDialogOpen} onOpenChange={setIsCharityDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-pink-500/30 hover:bg-pink-500/10">
                  <Heart className="h-4 w-4 mr-2 text-pink-500" />
                  Donate Earnings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5 text-pink-500" />
                    Donate to The Wittle Bear Foundation
                  </DialogTitle>
                  <DialogDescription>
                    Choose what percentage of your ad earnings to donate to animal welfare.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-pink-500 mb-2">
                      {charityDonationPercent}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      of your 70% ad revenue share
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={charityDonationPercent}
                      onChange={(e) => setCharityDonationPercent(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[0, 25, 50, 100].map((percent) => (
                      <Button
                        key={percent}
                        variant={charityDonationPercent === percent ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCharityDonationPercent(percent)}
                        className={charityDonationPercent === percent ? "bg-pink-500 hover:bg-pink-600" : ""}
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your earnings (example $100 ad revenue):</span>
                      <span className="font-medium">${(70 * (1 - charityDonationPercent / 100)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your donation:</span>
                      <span className="font-medium text-pink-500">${(70 * charityDonationPercent / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                      <span className="text-muted-foreground">Platform donation (automatic):</span>
                      <span className="font-medium text-pink-500">$30.00</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Total to Wittle Bear Foundation:</span>
                      <span className="text-pink-500">${(30 + 70 * charityDonationPercent / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    The Wittle Bear Foundation supports homeless LGBTQ+ youth and
                    animals in shelters - because everyone deserves love, safety, and a home.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCharityDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Donation preference saved",
                        description: `${charityDonationPercent}% of your ad earnings will go to The Wittle Bear Foundation`,
                      });
                      setIsCharityDialogOpen(false);
                    }}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Save Preference
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Platform Contribution</p>
              <p className="text-2xl font-bold text-pink-400">100%</p>
              <p className="text-xs text-muted-foreground">of our 30% share</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Your Donation</p>
              <p className="text-2xl font-bold text-pink-400">{charityDonationPercent}%</p>
              <p className="text-xs text-muted-foreground">of your 70% share</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Donated</p>
              <p className="text-2xl font-bold text-pink-400">{formatCurrency(0)}</p>
              <p className="text-xs text-muted-foreground">lifetime</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-pink-500/5 border border-pink-500/20 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              <Heart className="inline h-4 w-4 text-pink-500 mr-1" />
              Every ad impression helps those who need it most. The Wittle Bear Foundation was created in loving memory
              of a beloved yorkie, supporting homeless LGBTQ+ youth and shelter animals -
              because no one should ever feel alone or unwanted.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No payouts yet. Minimum payout is $50.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
