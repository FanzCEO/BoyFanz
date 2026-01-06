import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  Crown, Star, Check, ExternalLink, Lock, Zap, Users, Shield,
  Radio, Cloud, Video, MessageCircle, TrendingUp, Globe, Sparkles,
  Coins, Gift, ArrowUp, Heart, Eye, Share2, MessageSquare, Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FAN_PLATFORMS } from "@/../../shared/fanzEcosystemRegistry";

// FanzToken Achievement Tiers - EARNED not purchased
const FANZTOKEN_TIERS = [
  {
    id: 'curious-cock',
    infrastructureId: 'rising_star',
    name: 'Curious Cock',
    tokenRequirement: 0,
    tokenCap: 99,
    color: '#CD7F32',
    gradient: 'from-amber-700 to-amber-900',
    glow: 'rgba(205, 127, 50, 0.4)',
    icon: '🍆',
    tagline: 'Just getting started',
    description: 'Your journey begins here. Engage with content and start earning tokens.',
    revenueBoost: '1x',
    perks: [
      'Access to all FREE core platforms',
      'Basic profile customization',
      'Standard messaging',
      'View public content feeds'
    ],
    auxiliaryAccess: false
  },
  {
    id: 'hungry-hole',
    infrastructureId: 'elite',
    name: 'Hungry Hole',
    tokenRequirement: 100,
    tokenCap: 499,
    color: '#C0C0C0',
    gradient: 'from-gray-400 to-gray-600',
    glow: 'rgba(192, 192, 192, 0.4)',
    icon: '🕳️',
    tagline: 'Ready for more',
    description: 'You\'re getting serious. Unlock premium engagement features.',
    revenueBoost: '1.5x',
    perks: [
      'All Curious Cock perks +',
      'Priority in discovery feeds',
      'Advanced analytics dashboard',
      'Custom profile themes',
      'Early access to new features'
    ],
    auxiliaryAccess: true,
    auxiliaryDiscount: 0
  },
  {
    id: 'toyboy',
    infrastructureId: 'elite_pro',
    name: 'ToyBoy',
    tokenRequirement: 500,
    tokenCap: 1499,
    color: '#FF6B9D',
    gradient: 'from-pink-500 to-rose-600',
    glow: 'rgba(255, 107, 157, 0.5)',
    icon: '🧸',
    tagline: 'Play time premium',
    description: 'You\'re a power user. Enjoy exclusive creator tools and perks.',
    revenueBoost: '2x',
    perks: [
      'All Hungry Hole perks +',
      'Breeding Zone full access',
      'AI-powered content suggestions',
      'Custom watermarks',
      'Priority support queue',
      '10% discount on auxiliary platforms'
    ],
    auxiliaryAccess: true,
    auxiliaryDiscount: 10
  },
  {
    id: 'cum-guzzler',
    infrastructureId: 'elite_ultimate',
    name: 'Cum Guzzler',
    tokenRequirement: 1500,
    tokenCap: 4999,
    color: '#FFD700',
    gradient: 'from-yellow-500 to-amber-600',
    glow: 'rgba(255, 215, 0, 0.5)',
    icon: '💦',
    tagline: 'Swallow it all',
    description: 'Elite status unlocked. Maximum engagement tools and visibility.',
    revenueBoost: '5x',
    perks: [
      'All ToyBoy perks +',
      'Starz Studio Pro access',
      'Mass messaging tools',
      'Featured creator spotlight',
      'Revenue analytics dashboard',
      '25% discount on auxiliary platforms',
      'Dedicated account manager'
    ],
    auxiliaryAccess: true,
    auxiliaryDiscount: 25,
    isPopular: true
  },
  {
    id: 'premium-stud',
    infrastructureId: 'platinum',
    name: 'Premium Stud',
    tokenRequirement: 5000,
    tokenCap: null,
    color: '#E5E4E2',
    gradient: 'from-gray-200 via-white to-gray-300',
    glow: 'rgba(229, 228, 226, 0.6)',
    icon: '👑',
    tagline: 'The alpha king',
    description: 'You\'ve reached the pinnacle. Unlimited access and maximum benefits.',
    revenueBoost: '5x',
    perks: [
      'EVERYTHING Unlocked',
      'FanzVault unlimited storage',
      'White label options',
      'API access for integrations',
      'VIP events & networking',
      '50% discount on auxiliary platforms',
      'White glove concierge service',
      'Early access to ALL new features',
      'Custom domain support'
    ],
    auxiliaryAccess: true,
    auxiliaryDiscount: 50
  }
];

// How to earn FanzTokens
const TOKEN_EARNING_METHODS = [
  {
    action: 'Post Content',
    tokens: '5-25',
    icon: Video,
    description: 'Upload photos, videos, or stories'
  },
  {
    action: 'Receive Likes',
    tokens: '1',
    icon: Heart,
    description: 'Per like on your content'
  },
  {
    action: 'Get Comments',
    tokens: '2',
    icon: MessageSquare,
    description: 'Per comment on your posts'
  },
  {
    action: 'Content Views',
    tokens: '1 per 100',
    icon: Eye,
    description: 'Per 100 views on your content'
  },
  {
    action: 'Shares',
    tokens: '5',
    icon: Share2,
    description: 'When someone shares your content'
  },
  {
    action: 'New Subscriber',
    tokens: '10',
    icon: Users,
    description: 'When someone subscribes to you'
  },
  {
    action: 'Daily Login',
    tokens: '2',
    icon: Gift,
    description: 'Login bonus every day'
  },
  {
    action: 'Weekly Streak',
    tokens: '25',
    icon: Award,
    description: '7-day consecutive login bonus'
  }
];

// Auxiliary platforms that cost tokens
const AUXILIARY_PLATFORMS = [
  {
    name: 'FanzRoulette',
    description: 'Random video chat with fans',
    tokenCost: 30,
    icon: Video,
    color: '#FF4B4B'
  },
  {
    name: 'FanzSwipe',
    description: 'Creator dating & collaboration',
    tokenCost: 40,
    icon: Heart,
    color: '#FF6B9D'
  },
  {
    name: 'FanzMeet',
    description: 'Schedule 1-on-1 video meetups',
    tokenCost: 50,
    icon: Users,
    color: '#4B7BFF'
  },
  {
    name: 'FanzRadio',
    description: 'Host your own podcast',
    tokenCost: 35,
    icon: Radio,
    color: '#9B4BFF'
  },
  {
    name: 'FanzCloud Pro',
    description: 'Premium cloud storage vault',
    tokenCost: 45,
    icon: Cloud,
    color: '#4BFFFF'
  },
  {
    name: 'FanzAI Studio',
    description: 'AI content creation tools',
    tokenCost: 40,
    icon: Sparkles,
    color: '#FFB84B'
  }
];

export default function StarzElite() {
  const [selectedTier, setSelectedTier] = useState<string | null>('cum-guzzler');
  const [userTokens] = useState(247); // Example: user's current token balance

  const activePlatforms = FAN_PLATFORMS.filter(p => p.status === 'active');

  // Calculate user's current tier based on tokens
  const getCurrentTier = (tokens: number) => {
    for (let i = FANZTOKEN_TIERS.length - 1; i >= 0; i--) {
      if (tokens >= FANZTOKEN_TIERS[i].tokenRequirement) {
        return FANZTOKEN_TIERS[i];
      }
    }
    return FANZTOKEN_TIERS[0];
  };

  const currentTier = getCurrentTier(userTokens);
  const nextTier = FANZTOKEN_TIERS[FANZTOKEN_TIERS.findIndex(t => t.id === currentTier.id) + 1];
  const progressToNext = nextTier
    ? ((userTokens - currentTier.tokenRequirement) / (nextTier.tokenRequirement - currentTier.tokenRequirement)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-950/10 to-black relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 20% 50%, rgba(255, 107, 157, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600/20 to-yellow-600/20 rounded-full border border-pink-500/30 mb-6">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-semibold text-white">FanzToken Rewards Program</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span
              className="bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Earn Your Status
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            FanzTokens are <span className="text-yellow-400 font-semibold">earned through engagement</span>, not purchased.
            Post content, interact with fans, and climb the tiers to unlock exclusive perks and revenue multipliers.
          </p>

          {/* FREE Platform Banner */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Check className="h-6 w-6 text-green-400" />
              <span className="text-2xl font-bold text-green-400">ALL CORE PLATFORMS ARE FREE</span>
            </div>
            <p className="text-gray-300">
              BoyFanz, GirlFanz, GayFanz, and all {activePlatforms.length}+ FANZ platforms are completely free to use.
              FanzTokens unlock premium auxiliary features and boost your revenue share.
            </p>
          </div>

          {/* User's Current Status */}
          <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{currentTier.icon}</span>
                <div className="text-left">
                  <div className="text-sm text-gray-400">Your Current Tier</div>
                  <div className="text-xl font-bold" style={{ color: currentTier.color }}>{currentTier.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Token Balance</div>
                <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                  <Coins className="h-5 w-5" />
                  {userTokens.toLocaleString()}
                </div>
              </div>
            </div>

            {nextTier && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress to {nextTier.name}</span>
                  <span className="text-white">{nextTier.tokenRequirement - userTokens} tokens needed</span>
                </div>
                <Progress value={progressToNext} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* How to Earn Tokens */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            How to Earn FanzTokens
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Every action earns you tokens. The more you engage, the faster you climb. Token balance is calculated on a rolling 30-day window.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TOKEN_EARNING_METHODS.map((method) => {
              const MethodIcon = method.icon;
              return (
                <Card key={method.action} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-yellow-500/30 transition-all">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <MethodIcon className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="text-lg font-bold text-yellow-400 mb-1">+{method.tokens}</div>
                    <div className="text-sm font-semibold text-white mb-1">{method.action}</div>
                    <div className="text-xs text-gray-400">{method.description}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Achievement Tiers */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Achievement Tiers
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Your tier is determined by your rolling 30-day token balance. Earn more, unlock more. No subscriptions required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {FANZTOKEN_TIERS.map((tier, index) => {
              const isSelected = selectedTier === tier.id;
              const isCurrentTier = currentTier.id === tier.id;
              const isUnlocked = userTokens >= tier.tokenRequirement;

              return (
                <Card
                  key={tier.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 cursor-pointer",
                    isSelected ? "ring-2 ring-offset-2 ring-offset-black scale-105" : "hover:scale-102",
                    "bg-black/60 backdrop-blur-sm border-2",
                    !isUnlocked && "opacity-60"
                  )}
                  style={{
                    borderColor: isCurrentTier ? tier.color : isUnlocked ? `${tier.color}80` : '#333',
                    boxShadow: isSelected ? `0 0 30px ${tier.glow}` : isCurrentTier ? `0 0 20px ${tier.glow}` : 'none'
                  }}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  {tier.isPopular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  {isCurrentTier && (
                    <div className="absolute top-0 left-0">
                      <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                        YOUR TIER
                      </div>
                    </div>
                  )}

                  <CardContent className="p-5">
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-2">{tier.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                      <p className="text-xs text-gray-400">{tier.tagline}</p>
                    </div>

                    {/* Token Requirement */}
                    <div className="text-center mb-4 pb-4 border-b border-white/10">
                      <div className="text-sm text-gray-400 mb-1">Required Tokens</div>
                      <div className="text-2xl font-black flex items-center justify-center gap-1" style={{ color: tier.color }}>
                        <Coins className="h-5 w-5" />
                        {tier.tokenRequirement.toLocaleString()}
                        {tier.tokenCap && <span className="text-sm font-normal text-gray-500">- {tier.tokenCap.toLocaleString()}</span>}
                      </div>
                      <div className="mt-2">
                        <Badge
                          className="text-xs"
                          style={{ backgroundColor: `${tier.color}30`, color: tier.color }}
                        >
                          {tier.revenueBoost} Revenue Boost
                        </Badge>
                      </div>
                    </div>

                    {/* Key Perks Preview */}
                    <div className="space-y-1.5 mb-4">
                      {tier.perks.slice(0, 4).map((perk, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-300">{perk}</span>
                        </div>
                      ))}
                      {tier.perks.length > 4 && (
                        <div className="text-xs text-gray-500 pl-5">+{tier.perks.length - 4} more perks</div>
                      )}
                    </div>

                    {/* Auxiliary Discount */}
                    {tier.auxiliaryDiscount > 0 && (
                      <div className="bg-purple-500/20 rounded-lg p-2 text-center mb-4">
                        <span className="text-xs text-purple-300">{tier.auxiliaryDiscount}% off auxiliary platforms</span>
                      </div>
                    )}

                    {!isUnlocked && (
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm">{tier.tokenRequirement - userTokens} tokens to unlock</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Auxiliary Platforms */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Auxiliary Platforms
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Spend your tokens on premium auxiliary features. Monthly access costs shown below. Higher tiers get discounts!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AUXILIARY_PLATFORMS.map((platform) => {
              const PlatformIcon = platform.icon;
              const discountedCost = currentTier.auxiliaryDiscount
                ? Math.round(platform.tokenCost * (1 - currentTier.auxiliaryDiscount / 100))
                : platform.tokenCost;

              return (
                <Card key={platform.name} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-white/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${platform.color}20` }}
                      >
                        <PlatformIcon className="h-6 w-6" style={{ color: platform.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{platform.name}</h3>
                        <p className="text-sm text-gray-400 mb-3">{platform.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Coins className="h-3 w-3 mr-1" />
                            {discountedCost}/month
                          </Badge>
                          {currentTier.auxiliaryDiscount > 0 && (
                            <span className="text-xs text-gray-500 line-through">{platform.tokenCost}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Free Core Platforms */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            <span className="text-green-400">FREE</span> Core Platforms
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            All core FANZ platforms are completely free to use. Create content, build your audience, and earn across the entire network.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activePlatforms.map((platform) => (
              <a
                key={platform.id}
                href={`https://${platform.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="bg-black/40 backdrop-blur-sm border-green-500/20 hover:border-green-500/50 transition-all duration-300 h-full">
                  <CardContent className="p-4 text-center">
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500/20 text-green-400 text-xs border-green-500/30">FREE</Badge>
                    </div>
                    <div
                      className="w-14 h-14 mx-auto mb-3 rounded-lg flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${platform.primaryColor}20`,
                        color: platform.primaryColor
                      }}
                    >
                      {platform.name[0]}
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">{platform.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{platform.tagline}</p>
                    <div className="flex items-center justify-center gap-1 text-xs" style={{ color: platform.primaryColor }}>
                      <span>Visit</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* Revenue Boost Explanation */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-500/30 rounded-xl p-8 text-center">
            <TrendingUp className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Revenue Boost Multipliers</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              Higher tiers earn a bigger cut of platform revenue. At Premium Stud tier, you earn <span className="text-yellow-400 font-bold">5x</span> the
              base revenue share on all transactions. This applies to tips, subscriptions, and PPV sales.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {FANZTOKEN_TIERS.map((tier) => (
                <div key={tier.id} className="bg-black/40 rounded-lg px-4 py-2">
                  <span className="text-sm" style={{ color: tier.color }}>{tier.name}</span>
                  <span className="text-white font-bold ml-2">{tier.revenueBoost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Start Earning Today
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Every like, post, and interaction earns you tokens. Climb the tiers and unlock your full creator potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/feed">
                <Button className="bg-gradient-to-r from-pink-600 to-yellow-600 hover:from-pink-500 hover:to-yellow-500 text-white px-8 py-6 text-lg">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Earning Tokens
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Your Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
