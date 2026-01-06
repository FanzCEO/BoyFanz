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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Globe, Settings, Users, DollarSign, Lock, Unlock, Plus,
  Edit2, Trash2, ExternalLink, Eye, Crown, Sparkles, Palette,
  Server, Shield, Link2, BarChart3, TrendingUp, Activity,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Zap, Tag
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface Platform {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  category: 'general' | 'niche' | 'premium' | 'restricted';
  status: 'active' | 'maintenance' | 'disabled';
  requiresMembership: boolean;
  membershipTier?: string;
  isSSO: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalUsers: number;
    activeCreators: number;
    monthlyRevenue: number;
    growth: number;
  };
}

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  platformAccess: string[];
  isPopular: boolean;
  maxPlatforms: number;
  createdAt: string;
}

interface PricingConfig {
  platformFee: number;
  creatorShare: number;
  minimumWithdrawal: number;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
  currencies: string[];
  paymentProcessors: string[];
}

// All Fanz platforms
const PLATFORMS: Platform[] = [
  {
    id: 'boyfanz',
    name: 'BoyFanz',
    slug: 'boyfanz',
    domain: 'boyfanz.fanz.website',
    logoUrl: '/platforms/boyfanz-logo.png',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    description: 'Premium male content creators',
    category: 'niche',
    status: 'active',
    requiresMembership: false,
    isSSO: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-22',
    stats: { totalUsers: 15420, activeCreators: 342, monthlyRevenue: 125000, growth: 12.5 },
  },
  {
    id: 'girlfanz',
    name: 'GirlFanz',
    slug: 'girlfanz',
    domain: 'girlfanz.fanz.website',
    logoUrl: '/platforms/girlfanz-logo.png',
    primaryColor: '#ec4899',
    secondaryColor: '#f472b6',
    description: 'Premium female content creators',
    category: 'niche',
    status: 'active',
    requiresMembership: false,
    isSSO: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-22',
    stats: { totalUsers: 28500, activeCreators: 856, monthlyRevenue: 345000, growth: 18.2 },
  },
  {
    id: 'transfanz',
    name: 'TransFanz',
    slug: 'transfanz',
    domain: 'transfanz.fanz.website',
    logoUrl: '/platforms/transfanz-logo.png',
    primaryColor: '#14b8a6',
    secondaryColor: '#2dd4bf',
    description: 'Trans & non-binary creators',
    category: 'niche',
    status: 'active',
    requiresMembership: false,
    isSSO: true,
    createdAt: '2024-02-01',
    updatedAt: '2024-12-22',
    stats: { totalUsers: 8750, activeCreators: 189, monthlyRevenue: 78000, growth: 22.1 },
  },
  {
    id: 'gayfanz',
    name: 'GayFanz',
    slug: 'gayfanz',
    domain: 'gayfanz.fanz.website',
    logoUrl: '/platforms/gayfanz-logo.png',
    primaryColor: '#f59e0b',
    secondaryColor: '#fbbf24',
    description: 'LGBTQ+ male content',
    category: 'niche',
    status: 'active',
    requiresMembership: false,
    isSSO: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-12-22',
    stats: { totalUsers: 19200, activeCreators: 445, monthlyRevenue: 189000, growth: 15.8 },
  },
  {
    id: 'milffanz',
    name: 'MilfFanz',
    slug: 'milffanz',
    domain: 'milffanz.fanz.website',
    logoUrl: '/platforms/milffanz-logo.png',
    primaryColor: '#ef4444',
    secondaryColor: '#f87171',
    description: 'Mature content creators',
    category: 'niche',
    status: 'active',
    requiresMembership: false,
    isSSO: true,
    createdAt: '2024-03-01',
    updatedAt: '2024-12-22',
    stats: { totalUsers: 22100, activeCreators: 512, monthlyRevenue: 234000, growth: 14.3 },
  },
  {
    id: 'taboofanz',
    name: 'TabooFanz',
    slug: 'taboofanz',
    domain: 'taboofanz.fanz.website',
    logoUrl: '/platforms/taboofanz-logo.png',
    primaryColor: '#7c3aed',
    secondaryColor: '#a78bfa',
    description: 'Roleplay & fantasy content',
    category: 'premium',
    status: 'active',
    requiresMembership: true,
    membershipTier: 'premium',
    isSSO: true,
    createdAt: '2024-04-01',
    updatedAt: '2024-12-22',
    stats: { totalUsers: 5680, activeCreators: 128, monthlyRevenue: 89000, growth: 28.5 },
  },
  {
    id: 'pupfanz',
    name: 'PupFanz',
    slug: 'pupfanz',
    domain: 'pupfanz.fanz.website',
    logoUrl: '/platforms/pupfanz-logo.png',
    primaryColor: '#059669',
    secondaryColor: '#34d399',
    description: 'Pet play community',
    category: 'premium',
    status: 'active',
    requiresMembership: true,
    membershipTier: 'premium',
    isSSO: true,
    createdAt: '2024-05-01',
    updatedAt: '2024-12-22',
    stats: { totalUsers: 3420, activeCreators: 87, monthlyRevenue: 45000, growth: 31.2 },
  },
];

const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: ['Access to public platforms', 'Basic messaging', 'Standard support'],
    platformAccess: ['boyfanz', 'girlfanz', 'transfanz', 'gayfanz', 'milffanz', 'femmefanz', 'bearfanz', 'daddyfanz', 'cougarfanz'],
    isPopular: false,
    maxPlatforms: 9,
    createdAt: '2024-01-01',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    features: ['All Free features', 'Access to premium platforms', 'Priority support', 'Early access to new features', 'No ads'],
    platformAccess: ['*'],
    isPopular: true,
    maxPlatforms: -1,
    createdAt: '2024-01-01',
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 19.99,
    interval: 'month',
    features: ['All Premium features', 'Exclusive content access', 'VIP badge', 'Direct creator messaging', 'Custom profile themes'],
    platformAccess: ['*'],
    isPopular: false,
    maxPlatforms: -1,
    createdAt: '2024-01-01',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 299.99,
    interval: 'year',
    features: ['All VIP features forever', 'Founding member badge', 'Revenue sharing program', 'Beta access to all features'],
    platformAccess: ['*'],
    isPopular: false,
    maxPlatforms: -1,
    createdAt: '2024-01-01',
  },
];

export default function PlatformManagement() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("platforms");
  const [showPlatformDialog, setShowPlatformDialog] = useState(false);
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);

  // Platform form state
  const [platformForm, setPlatformForm] = useState({
    name: "",
    slug: "",
    domain: "",
    description: "",
    primaryColor: "#6366f1",
    category: "niche" as const,
    requiresMembership: false,
    membershipTier: "",
    status: "active" as const,
  });

  // Tier form state
  const [tierForm, setTierForm] = useState({
    name: "",
    price: 0,
    interval: "month" as const,
    features: "",
    platformAccess: [] as string[],
    isPopular: false,
  });

  // Pricing config state
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    platformFee: 20,
    creatorShare: 80,
    minimumWithdrawal: 50,
    payoutSchedule: 'weekly',
    currencies: ['USD', 'EUR', 'GBP'],
    paymentProcessors: ['stripe', 'paypal', 'crypto'],
  });

  const getStatusBadge = (status: Platform['status']) => {
    const variants = {
      active: { variant: 'default' as const, className: 'bg-green-600', label: 'Active' },
      maintenance: { variant: 'secondary' as const, className: 'bg-yellow-600', label: 'Maintenance' },
      disabled: { variant: 'destructive' as const, className: '', label: 'Disabled' },
    };
    const config = variants[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: Platform['category']) => {
    const variants = {
      general: { variant: 'outline' as const, label: 'General' },
      niche: { variant: 'secondary' as const, label: 'Niche' },
      premium: { variant: 'default' as const, label: 'Premium' },
      restricted: { variant: 'destructive' as const, label: 'Restricted' },
    };
    const config = variants[category];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalStats = PLATFORMS.reduce(
    (acc, p) => ({
      users: acc.users + p.stats.totalUsers,
      creators: acc.creators + p.stats.activeCreators,
      revenue: acc.revenue + p.stats.monthlyRevenue,
    }),
    { users: 0, creators: 0, revenue: 0 }
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Platform Management
          </h1>
          <p className="text-muted-foreground">Manage Fanz network platforms, pricing, tiers, and SSO settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setSelectedPlatform(null);
            setPlatformForm({
              name: "",
              slug: "",
              domain: "",
              description: "",
              primaryColor: "#6366f1",
              category: "niche",
              requiresMembership: false,
              membershipTier: "",
              status: "active",
            });
            setShowPlatformDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Platform
          </Button>
        </div>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PLATFORMS.length}</div>
            <p className="text-xs text-muted-foreground">
              {PLATFORMS.filter(p => p.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.users.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.2% this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.creators.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.7% this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Network Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalStats.revenue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +22.4% this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="tiers">Membership Tiers</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Fees</TabsTrigger>
          <TabsTrigger value="sso">SSO Settings</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Platforms</CardTitle>
              <CardDescription>Manage individual platform settings and configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PLATFORMS.map((platform) => (
                    <TableRow key={platform.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={platform.logoUrl} />
                            <AvatarFallback style={{ backgroundColor: platform.primaryColor }} className="text-white text-xs">
                              {platform.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">{platform.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a href={`https://${platform.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          {platform.domain}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>{getCategoryBadge(platform.category)}</TableCell>
                      <TableCell>{getStatusBadge(platform.status)}</TableCell>
                      <TableCell>
                        {platform.requiresMembership ? (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            {platform.membershipTier}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Unlock className="h-3 w-3" />
                            Open
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{platform.stats.totalUsers.toLocaleString()}</p>
                          <p className="text-xs text-green-600">+{platform.stats.growth}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">${(platform.stats.monthlyRevenue / 1000).toFixed(0)}K/mo</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => {
                            setSelectedPlatform(platform);
                            setPlatformForm({
                              name: platform.name,
                              slug: platform.slug,
                              domain: platform.domain,
                              description: platform.description,
                              primaryColor: platform.primaryColor,
                              category: platform.category,
                              requiresMembership: platform.requiresMembership,
                              membershipTier: platform.membershipTier || "",
                              status: platform.status,
                            });
                            setShowPlatformDialog(true);
                          }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Membership Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Membership Tiers</h3>
              <p className="text-sm text-muted-foreground">Configure subscription tiers and platform access</p>
            </div>
            <Button onClick={() => {
              setSelectedTier(null);
              setTierForm({
                name: "",
                price: 0,
                interval: "month",
                features: "",
                platformAccess: [],
                isPopular: false,
              });
              setShowTierDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MEMBERSHIP_TIERS.map((tier) => (
              <Card key={tier.id} className={`relative ${tier.isPopular ? 'border-primary border-2' : ''}`}>
                {tier.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {tier.name}
                    <Button size="sm" variant="ghost" onClick={() => {
                      setSelectedTier(tier);
                      setTierForm({
                        name: tier.name,
                        price: tier.price,
                        interval: tier.interval,
                        features: tier.features.join('\n'),
                        platformAccess: tier.platformAccess,
                        isPopular: tier.isPopular,
                      });
                      setShowTierDialog(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/{tier.interval}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Features:</p>
                    <ul className="space-y-1">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Platform Access:</p>
                    {tier.platformAccess.includes('*') ? (
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="h-3 w-3" />
                        All Platforms
                      </Badge>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {tier.platformAccess.slice(0, 3).map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                        ))}
                        {tier.platformAccess.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tier.platformAccess.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pricing & Fees Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Split
                </CardTitle>
                <CardDescription>Configure platform fees and creator payouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Platform Fee (%)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={pricingConfig.platformFee}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          platformFee: parseInt(e.target.value),
                          creatorShare: 100 - parseInt(e.target.value)
                        })}
                        className="w-24"
                      />
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${pricingConfig.platformFee}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Creator Share (%)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={pricingConfig.creatorShare}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          creatorShare: parseInt(e.target.value),
                          platformFee: 100 - parseInt(e.target.value)
                        })}
                        className="w-24"
                      />
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${pricingConfig.creatorShare}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Withdrawal ($)</Label>
                      <Input
                        type="number"
                        value={pricingConfig.minimumWithdrawal}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          minimumWithdrawal: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payout Schedule</Label>
                      <Select
                        value={pricingConfig.payoutSchedule}
                        onValueChange={(value: any) => setPricingConfig({
                          ...pricingConfig,
                          payoutSchedule: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  Save Pricing Configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Payment Processors
                </CardTitle>
                <CardDescription>Configure available payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#635bff] rounded flex items-center justify-center text-white font-bold">S</div>
                      <div>
                        <p className="font-medium">Stripe</p>
                        <p className="text-xs text-muted-foreground">Cards, Apple Pay, Google Pay</p>
                      </div>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#003087] rounded flex items-center justify-center text-white font-bold">P</div>
                      <div>
                        <p className="font-medium">PayPal</p>
                        <p className="text-xs text-muted-foreground">PayPal balance, cards</p>
                      </div>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f7931a] rounded flex items-center justify-center text-white font-bold">B</div>
                      <div>
                        <p className="font-medium">Crypto</p>
                        <p className="text-xs text-muted-foreground">Bitcoin, Ethereum, USDT</p>
                      </div>
                    </div>
                    <Switch checked={true} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-400 rounded flex items-center justify-center text-white font-bold">C</div>
                      <div>
                        <p className="font-medium">CCBill</p>
                        <p className="text-xs text-muted-foreground">Adult-friendly processor</p>
                      </div>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Supported Currencies</Label>
                  <div className="flex flex-wrap gap-2">
                    {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map((currency) => (
                      <Badge
                        key={currency}
                        variant={pricingConfig.currencies.includes(currency) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const newCurrencies = pricingConfig.currencies.includes(currency)
                            ? pricingConfig.currencies.filter(c => c !== currency)
                            : [...pricingConfig.currencies, currency];
                          setPricingConfig({ ...pricingConfig, currencies: newCurrencies });
                        }}
                      >
                        {currency}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SSO Settings Tab */}
        <TabsContent value="sso" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Single Sign-On (SSO) Configuration
              </CardTitle>
              <CardDescription>Configure cross-platform authentication for the Fanz network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">Fanz SSO is Active</p>
                    <p className="text-sm text-muted-foreground">Users can seamlessly switch between platforms</p>
                  </div>
                </div>
                <Switch checked={true} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SSO Session Duration</Label>
                  <Select defaultValue="7d">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Authentication Method</Label>
                  <Select defaultValue="jwt">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jwt">JWT Tokens</SelectItem>
                      <SelectItem value="session">Session Cookies</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block">SSO-Enabled Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PLATFORMS.map((platform) => (
                    <div key={platform.id} className="flex items-center gap-2 p-2 border rounded-lg">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback style={{ backgroundColor: platform.primaryColor }} className="text-white text-xs">
                          {platform.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium flex-1">{platform.name}</span>
                      <Switch checked={platform.isSSO} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Platform Access Control
              </CardTitle>
              <CardDescription>Configure which membership tiers have access to each platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Free</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>VIP</TableHead>
                    <TableHead>Lifetime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PLATFORMS.map((platform) => (
                    <TableRow key={platform.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback style={{ backgroundColor: platform.primaryColor }} className="text-white text-xs">
                              {platform.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{platform.name}</span>
                          {platform.requiresMembership && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch checked={!platform.requiresMembership} />
                      </TableCell>
                      <TableCell>
                        <Switch checked={true} />
                      </TableCell>
                      <TableCell>
                        <Switch checked={true} />
                      </TableCell>
                      <TableCell>
                        <Switch checked={true} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Platform Edit Dialog */}
      <Dialog open={showPlatformDialog} onOpenChange={setShowPlatformDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlatform ? 'Edit Platform' : 'Add New Platform'}</DialogTitle>
            <DialogDescription>Configure platform settings and access controls</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input
                value={platformForm.name}
                onChange={(e) => setPlatformForm({ ...platformForm, name: e.target.value })}
                placeholder="e.g., NewFanz"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={platformForm.slug}
                onChange={(e) => setPlatformForm({ ...platformForm, slug: e.target.value })}
                placeholder="e.g., newfanz"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Domain</Label>
              <Input
                value={platformForm.domain}
                onChange={(e) => setPlatformForm({ ...platformForm, domain: e.target.value })}
                placeholder="e.g., newfanz.fanz.website"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Textarea
                value={platformForm.description}
                onChange={(e) => setPlatformForm({ ...platformForm, description: e.target.value })}
                placeholder="Brief description of this platform"
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={platformForm.primaryColor}
                  onChange={(e) => setPlatformForm({ ...platformForm, primaryColor: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={platformForm.primaryColor}
                  onChange={(e) => setPlatformForm({ ...platformForm, primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={platformForm.category}
                onValueChange={(value: any) => setPlatformForm({ ...platformForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="niche">Niche</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={platformForm.status}
                onValueChange={(value: any) => setPlatformForm({ ...platformForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Access Control</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={platformForm.requiresMembership}
                  onCheckedChange={(checked) => setPlatformForm({ ...platformForm, requiresMembership: checked })}
                />
                <span className="text-sm">Requires Membership</span>
              </div>
            </div>
            {platformForm.requiresMembership && (
              <div className="space-y-2">
                <Label>Minimum Tier</Label>
                <Select
                  value={platformForm.membershipTier}
                  onValueChange={(value) => setPlatformForm({ ...platformForm, membershipTier: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlatformDialog(false)}>
              Cancel
            </Button>
            <Button>
              {selectedPlatform ? 'Save Changes' : 'Create Platform'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier Edit Dialog */}
      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTier ? 'Edit Membership Tier' : 'Add New Tier'}</DialogTitle>
            <DialogDescription>Configure pricing and features for this tier</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier Name</Label>
                <Input
                  value={tierForm.name}
                  onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                  placeholder="e.g., Gold"
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={tierForm.price}
                  onChange={(e) => setTierForm({ ...tierForm, price: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Billing Interval</Label>
              <Select
                value={tierForm.interval}
                onValueChange={(value: any) => setTierForm({ ...tierForm, interval: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                value={tierForm.features}
                onChange={(e) => setTierForm({ ...tierForm, features: e.target.value })}
                placeholder="Enter features, one per line"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={tierForm.isPopular}
                onCheckedChange={(checked) => setTierForm({ ...tierForm, isPopular: checked })}
              />
              <span className="text-sm">Mark as Most Popular</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierDialog(false)}>
              Cancel
            </Button>
            <Button>
              {selectedTier ? 'Save Changes' : 'Create Tier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
