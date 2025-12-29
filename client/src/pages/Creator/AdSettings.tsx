// @ts-nocheck
/**
 * Creator Ad Settings Page
 *
 * Allows creators to:
 * - Opt-in to different ad placements (profile, feed, videos)
 * - Choose which ad categories to allow
 * - Set donation percentage to Wittle Bear Foundation
 * - View their ad revenue stats
 * - See their charity supporter badges
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  DollarSign,
  Eye,
  MousePointer,
  Award,
  Image,
  Video,
  LayoutGrid,
  Sidebar,
  Film,
  BookOpen,
  Shield,
  TrendingUp,
  Users,
  Home,
  Dog,
  AlertCircle,
  Check,
  Sparkles,
} from 'lucide-react';

// Ad placement options
const AD_PLACEMENTS = [
  {
    id: 'enableProfileBanner',
    label: 'Profile Banner Ads',
    description: 'Display banner ads on your profile page',
    icon: Image,
    recommended: true,
  },
  {
    id: 'enableFeedAds',
    label: 'Feed Ads',
    description: 'Show ads between your posts in the feed',
    icon: LayoutGrid,
    recommended: true,
  },
  {
    id: 'enableVideoPreroll',
    label: 'Video Pre-roll Ads',
    description: 'Short ads before your video content plays',
    icon: Video,
    recommended: false,
  },
  {
    id: 'enableVideoOverlay',
    label: 'Video Overlay Ads',
    description: 'Non-intrusive overlay ads during videos',
    icon: Film,
    recommended: false,
  },
  {
    id: 'enableSidebar',
    label: 'Sidebar Ads',
    description: 'Ads in the sidebar of your profile',
    icon: Sidebar,
    recommended: true,
  },
  {
    id: 'enableStoryAds',
    label: 'Story Ads',
    description: 'Ads between your stories',
    icon: BookOpen,
    recommended: false,
  },
];

// Ad categories
const AD_CATEGORIES = [
  { id: 'adult_products', label: 'Adult Products', emoji: '🔥' },
  { id: 'dating_apps', label: 'Dating Apps', emoji: '💕' },
  { id: 'wellness', label: 'Wellness', emoji: '💆' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'technology', label: 'Technology', emoji: '📱' },
  { id: 'general', label: 'General', emoji: '📦' },
];

// Badge tier colors
const BADGE_COLORS = {
  supporter: 'bg-purple-500',
  bronze: 'bg-amber-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  diamond: 'bg-cyan-300',
  champion: 'bg-red-500',
};

export default function CreatorAdSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settingsData, isLoading: loadingSettings } = useQuery({
    queryKey: ['creator-ad-settings'],
    queryFn: async () => {
      const res = await fetch('/api/creator-ads/settings', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load settings');
      return res.json();
    },
  });

  // Fetch stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['creator-ad-stats'],
    queryFn: async () => {
      const res = await fetch('/api/creator-ads/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    },
  });

  // Fetch charity leaderboard
  const { data: charityData } = useQuery({
    queryKey: ['wittle-bear-leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/creator-ads/charity/wittle-bear?limit=10');
      if (!res.ok) throw new Error('Failed to load charity data');
      return res.json();
    },
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (updates: any) => {
      const res = await fetch('/api/creator-ads/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-ad-settings'] });
      queryClient.invalidateQueries({ queryKey: ['creator-ad-stats'] });
      toast({
        title: 'Settings Updated',
        description: 'Your ad preferences have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const settings = settingsData?.data;
  const stats = statsData?.data;
  const charity = charityData?.data;

  const [donationSlider, setDonationSlider] = useState(settings?.donationPercentage || 0);

  // Handle toggle change
  const handleToggle = (field: string, value: boolean) => {
    updateSettings.mutate({ [field]: value });
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    const current = settings?.allowedCategories || [];
    const updated = current.includes(categoryId)
      ? current.filter((c: string) => c !== categoryId)
      : [...current, categoryId];
    updateSettings.mutate({ allowedCategories: updated });
  };

  // Handle donation percentage change
  const handleDonationChange = (value: number[]) => {
    setDonationSlider(value[0]);
  };

  const handleDonationSave = () => {
    updateSettings.mutate({
      donationPercentage: donationSlider,
      donateToCharity: donationSlider > 0,
    });
  };

  if (loadingSettings || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <DollarSign className="h-8 w-8 text-green-500" />
          Ad Revenue Settings
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Earn extra income by enabling ads on your profile. You keep <span className="font-bold text-green-500">70%</span> of all ad revenue,
          and <span className="font-bold text-pink-500">30%</span> goes directly to the Wittle Bear Foundation to help homeless youth and shelter animals.
        </p>
      </div>

      {/* Revenue Split Banner */}
      <Card className="bg-gradient-to-r from-green-500/10 via-purple-500/10 to-pink-500/10 border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-500">100%</div>
              <div className="text-sm text-muted-foreground">Your Content Revenue</div>
              <div className="text-xs">Subscriptions, Tips, PPV</div>
            </div>
            <div className="space-y-2 border-x border-border px-4">
              <div className="text-4xl font-bold text-purple-500">70%</div>
              <div className="text-sm text-muted-foreground">Your Ad Revenue</div>
              <div className="text-xs">From opted-in ad placements</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-pink-500">30%</div>
              <div className="text-sm text-muted-foreground">Goes to Charity</div>
              <div className="text-xs">Wittle Bear Foundation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats?.totalImpressions?.toLocaleString() || 0}</div>
            <div className="text-sm text-muted-foreground">Total Impressions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MousePointer className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{stats?.totalClicks?.toLocaleString() || 0}</div>
            <div className="text-sm text-muted-foreground">Total Clicks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">${parseFloat(stats?.totalEarned || 0).toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="h-6 w-6 mx-auto mb-2 text-pink-500" />
            <div className="text-2xl font-bold">${parseFloat(stats?.totalDonated || 0).toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">You Donated</div>
          </CardContent>
        </Card>
      </div>

      {/* Charity Badge Section */}
      {stats?.badges?.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Your Charity Badges
            </CardTitle>
            <CardDescription>
              These badges are displayed on your profile to show your support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.badges.map((badge: any) => (
                <Badge
                  key={badge.id}
                  className={`${BADGE_COLORS[badge.tier as keyof typeof BADGE_COLORS]} text-white px-4 py-2 text-lg`}
                >
                  <span className="mr-2">{badge.badgeIcon}</span>
                  {badge.badgeName}
                  <span className="ml-2 opacity-75">${parseFloat(badge.totalDonated).toFixed(0)}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ad Placements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Ad Placements
          </CardTitle>
          <CardDescription>
            Choose where you want ads to appear. Each enabled placement earns you revenue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {AD_PLACEMENTS.map((placement) => {
            const Icon = placement.icon;
            const isEnabled = settings?.[placement.id] || false;

            return (
              <div
                key={placement.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isEnabled ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-500/20' : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${isEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{placement.label}</span>
                      {placement.recommended && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-500">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{placement.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleToggle(placement.id, checked)}
                  disabled={updateSettings.isPending}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Ad Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Allowed Ad Categories
          </CardTitle>
          <CardDescription>
            Control which types of ads can appear on your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AD_CATEGORIES.map((category) => {
              const isAllowed = settings?.allowedCategories?.includes(category.id);

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    isAllowed
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/50'
                  }`}
                  disabled={updateSettings.isPending}
                >
                  <span className="text-xl">{category.emoji}</span>
                  <span className="text-sm font-medium">{category.label}</span>
                  {isAllowed && <Check className="h-4 w-4 ml-auto" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charity Donation Settings */}
      <Card className="bg-gradient-to-r from-pink-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Donate to Wittle Bear Foundation
          </CardTitle>
          <CardDescription>
            Optionally donate part of your 70% ad revenue share to help homeless youth and shelter animals.
            You'll earn special badges that display on your profile!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Charity Info */}
          <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
            <div className="text-4xl">🐻</div>
            <div>
              <h3 className="font-bold">Wittle Bear Foundation</h3>
              <p className="text-sm text-muted-foreground">
                Supporting homeless youth and shelter animals across America. Every contribution helps
                provide food, shelter, and care for those in need.
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Home className="h-4 w-4 text-blue-500" /> Homeless Youth
                </span>
                <span className="flex items-center gap-1">
                  <Dog className="h-4 w-4 text-amber-500" /> Shelter Animals
                </span>
              </div>
            </div>
          </div>

          {/* Donation Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Your Donation Percentage</span>
              <span className="text-2xl font-bold text-pink-500">{donationSlider}%</span>
            </div>
            <Slider
              value={[donationSlider]}
              onValueChange={handleDonationChange}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Keep 100% of your 70%</span>
              <span>Donate all to charity</span>
            </div>

            {/* Preview of split */}
            {donationSlider > 0 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="text-sm font-medium">Revenue Split Preview (per $100 ad revenue)</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-500">
                      ${(70 - (70 * donationSlider / 100)).toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">You Keep</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-pink-500">
                      ${(70 * donationSlider / 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Your Donation</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-500">$30</div>
                    <div className="text-xs text-muted-foreground">Platform → Charity</div>
                  </div>
                </div>
                <div className="text-center pt-2">
                  <span className="text-sm">
                    Total to charity: <span className="font-bold text-pink-500">${(30 + (70 * donationSlider / 100)).toFixed(0)}</span>
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleDonationSave}
              disabled={updateSettings.isPending}
              className="w-full"
              variant={donationSlider > 0 ? 'default' : 'outline'}
            >
              {donationSlider > 0 ? (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Save & Start Donating {donationSlider}%
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>

          {/* Badge Tiers */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Charity Supporter Badge Tiers
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { tier: 'supporter', min: '$1', max: '$49', icon: '🐻', color: 'bg-purple-500' },
                { tier: 'bronze', min: '$50', max: '$199', icon: '🥉', color: 'bg-amber-600' },
                { tier: 'silver', min: '$200', max: '$499', icon: '🥈', color: 'bg-gray-400' },
                { tier: 'gold', min: '$500', max: '$999', icon: '🥇', color: 'bg-yellow-500' },
                { tier: 'diamond', min: '$1,000', max: '$4,999', icon: '💎', color: 'bg-cyan-300' },
                { tier: 'champion', min: '$5,000', max: '+', icon: '👑', color: 'bg-red-500' },
              ].map((t) => (
                <div
                  key={t.tier}
                  className={`p-3 rounded-lg border ${
                    settings?.badgeTier === t.tier ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.icon}</span>
                    <span className="capitalize font-medium">{t.tier}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t.min} - {t.max}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charity Leaderboard */}
      {charity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Charity Supporters
            </CardTitle>
            <CardDescription>
              Total raised: <span className="font-bold text-green-500">${parseFloat(charity.totalRaised || 0).toLocaleString()}</span>
              {' • '}
              {charity.donorCount} supporters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {charity.topDonors?.slice(0, 10).map((donor: any, index: number) => (
                <div
                  key={donor.userId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <img
                      src={donor.avatar || '/placeholder-avatar.png'}
                      alt={donor.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="font-medium">{donor.username}</span>
                    <span className="text-xl">{donor.badgeIcon}</span>
                  </div>
                  <span className="font-bold text-green-500">
                    ${parseFloat(donor.totalDonated).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Footer */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>How it works:</strong> When you enable ads, advertisers bid to show their ads on your profile,
                feed, and video content. You earn 70% of all ad revenue, with the remaining 30% going directly to the
                Wittle Bear Foundation.
              </p>
              <p>
                You can also choose to donate part or all of your 70% share to charity. Generous donors earn special
                badges that display on their profile, showing their commitment to helping homeless youth and shelter animals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
