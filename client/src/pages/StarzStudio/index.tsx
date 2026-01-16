/**
 * Starz Studio - AI Creator Hub
 * 
 * Membership earned through performance:
 * - Fan count, referrals, media quality, post volume
 * 
 * Integrations:
 * - AI.fanz.website: Central AI services
 * - FanzMediaHub: Media processing & quality scoring  
 * - FanzHubVault: Tier upgrades & achievements
 * - FanzCloud Mobile: App access for members
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, Lock, Unlock, Sparkles, TrendingUp, Users, 
  Image, Video, Zap, Crown, Diamond, Award, 
  Link as LinkIcon, Share2, BarChart3, Bot, Smartphone
} from 'lucide-react';

// Tier badge colors
const TIER_COLORS: Record<string, string> = {
  none: 'bg-gray-500',
  bronze_star: 'bg-amber-600',
  silver_star: 'bg-gray-400',
  gold_star: 'bg-yellow-500',
  platinum_star: 'bg-gray-300',
  diamond_star: 'bg-slate-400',
};

const TIER_ICONS: Record<string, React.ReactNode> = {
  none: <Lock className="w-4 h-4" />,
  bronze_star: <Star className="w-4 h-4" />,
  silver_star: <Star className="w-4 h-4" />,
  gold_star: <Crown className="w-4 h-4" />,
  platinum_star: <Award className="w-4 h-4" />,
  diamond_star: <Diamond className="w-4 h-4" />,
};

export default function StarzStudioPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch membership data
  const { data: membership, isLoading: membershipLoading, refetch: refetchMembership } = useQuery({
    queryKey: ['starz-membership'],
    queryFn: () => fetch('/api/starz-studio/membership').then(r => r.json()),
  });

  // Fetch tiers
  const { data: tiers } = useQuery({
    queryKey: ['starz-tiers'],
    queryFn: () => fetch('/api/starz-studio/tiers').then(r => r.json()),
  });

  // Fetch AI tools
  const { data: tools } = useQuery({
    queryKey: ['starz-tools'],
    queryFn: () => fetch('/api/starz-studio/tools').then(r => r.json()),
  });

  // Evaluate tier mutation
  const evaluateTier = useMutation({
    mutationFn: () => fetch('/api/starz-studio/evaluate', { method: 'POST' }).then(r => r.json()),
    onSuccess: () => refetchMembership(),
  });

  if (membershipLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentTier = membership?.membership?.currentTier || 'none';
  const metrics = membership?.metrics || {};
  const tierProgress = membership?.tierProgress;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Starz Studio</h1>
          <Badge className={TIER_COLORS[currentTier]}>
            {TIER_ICONS[currentTier]}
            <span className="ml-1 capitalize">{currentTier.replace('_', ' ')}</span>
          </Badge>
        </div>
        <p className="text-muted-foreground">
          AI-powered creator tools. Membership earned through performance.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
          <TabsTrigger value="platforms">Connected Platforms</TabsTrigger>
          <TabsTrigger value="tiers">Tier Benefits</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Fan Count */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Fans</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalFanCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.activeFanCount || 0} active
                </p>
              </CardContent>
            </Card>

            {/* Referrals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Referrals</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.successfulReferrals || 0}</div>
                <p className="text-xs text-muted-foreground">Qualified referrals</p>
              </CardContent>
            </Card>

            {/* Media Quality */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.mediaQualityScore || 0}/100</div>
                <p className="text-xs text-muted-foreground">Avg media quality</p>
              </CardContent>
            </Card>

            {/* Posts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalPostCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.monthlyPostCount || 0} this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tier Progress */}
          {tierProgress && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Progress to {tierProgress.nextTier?.replace('_', ' ')}</CardTitle>
                <CardDescription>
                  Meet these requirements to unlock the next tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fan Count</span>
                    <span>{Math.round(tierProgress.fanCountProgress)}%</span>
                  </div>
                  <Progress value={tierProgress.fanCountProgress} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Referrals</span>
                    <span>{Math.round(tierProgress.referralProgress)}%</span>
                  </div>
                  <Progress value={tierProgress.referralProgress} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Media Quality</span>
                    <span>{Math.round(tierProgress.qualityProgress)}%</span>
                  </div>
                  <Progress value={tierProgress.qualityProgress} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Post Count</span>
                    <span>{Math.round(tierProgress.postProgress)}%</span>
                  </div>
                  <Progress value={tierProgress.postProgress} />
                </div>

                <Button 
                  onClick={() => evaluateTier.mutate()} 
                  disabled={evaluateTier.isPending}
                  className="w-full mt-4"
                >
                  {evaluateTier.isPending ? 'Evaluating...' : 'Check My Tier Status'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* FanzCloud Access */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center gap-3">
              <Smartphone className="h-6 w-6" />
              <div>
                <CardTitle>FanzCloud Mobile App</CardTitle>
                <CardDescription>
                  {currentTier === 'none' 
                    ? 'Earn Bronze Star or higher to unlock mobile app access' 
                    : 'You have FanzCloud Mobile app access!'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {currentTier !== 'none' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Unlock className="h-4 w-4" />
                  <span>Access Level: {membership?.membership?.fanzcloudAccessLevel}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Locked - Earn membership to unlock</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="tools">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools?.map((tool: any) => (
              <Card key={tool.id} className={!tool.canAccess ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      {tool.name}
                    </CardTitle>
                    {tool.canAccess ? (
                      <Unlock className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {tool.minimumTier?.replace('_', ' ')} required
                    </Badge>
                    {tool.isBeta && <Badge variant="secondary">Beta</Badge>}
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    disabled={!tool.canAccess}
                    variant={tool.canAccess ? 'default' : 'secondary'}
                  >
                    {tool.canAccess ? 'Launch Tool' : 'Upgrade to Unlock'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Connected Platforms Tab */}
        <TabsContent value="platforms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Connected Platforms
              </CardTitle>
              <CardDescription>
                Connect your social accounts for cross-posting and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {['Twitter', 'Instagram', 'TikTok', 'YouTube', 'Discord', 'Telegram'].map((platform) => (
                  <div key={platform} className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">{platform}</span>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tier Benefits Tab */}
        <TabsContent value="tiers">
          <div className="space-y-4">
            {tiers?.map((tier: any) => (
              <Card key={tier.id} className={currentTier === tier.tier ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Badge className={TIER_COLORS[tier.tier]}>
                        {TIER_ICONS[tier.tier]}
                      </Badge>
                      {tier.displayName}
                    </CardTitle>
                    {currentTier === tier.tier && (
                      <Badge variant="outline">Current Tier</Badge>
                    )}
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">Requirements</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• {tier.minFanCount}+ fans ({tier.minActiveFanCount} active)</li>
                        <li>• {tier.minReferrals}+ referrals</li>
                        <li>• {tier.minMediaQualityScore}+ quality score</li>
                        <li>• {tier.minTotalPosts}+ posts ({tier.minMonthlyPosts}/month)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Benefits</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• FanzCloud: {tier.fanzcloudAccessLevel}</li>
                        <li>• {tier.aiToolsUnlocked?.length || 0} AI tools unlocked</li>
                        {tier.features?.slice(0, 3).map((f: string) => (
                          <li key={f}>• {f.replace(/_/g, ' ')}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
