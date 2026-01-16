/**
 * Starz Program Information & Signup Page
 *
 * Explains the performance-based Starz membership system before creators sign up
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Star, Users, Camera, Zap, TrendingUp, Award, Crown, CheckCircle2, ArrowRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tierData = [
  {
    tier: "bronze_star",
    name: "Bronze Star",
    color: "from-amber-600 to-amber-700",
    textColor: "text-amber-400",
    borderColor: "border-amber-600/30",
    requirements: {
      fans: 50,
      referrals: 3,
      quality: 40,
      posts: 20,
    },
    benefits: [
      "Basic AI tools for content creation",
      "FanzCloud Mobile basic access",
      "Creator analytics dashboard",
      "Community forum access"
    ],
    icon: Star
  },
  {
    tier: "silver_star",
    name: "Silver Star",
    color: "from-gray-400 to-gray-500",
    textColor: "text-gray-300",
    borderColor: "border-gray-400/30",
    requirements: {
      fans: 250,
      referrals: 10,
      quality: 55,
      posts: 75,
    },
    benefits: [
      "Enhanced AI features",
      "Fan insights & analytics",
      "DM templates library",
      "Priority support response",
      "All Bronze benefits"
    ],
    icon: Star
  },
  {
    tier: "gold_star",
    name: "Gold Star",
    color: "from-yellow-500 to-yellow-600",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    requirements: {
      fans: 1000,
      referrals: 25,
      quality: 70,
      posts: 200,
    },
    benefits: [
      "Full AI suite access",
      "Video editor with effects",
      "AI pricing optimizer",
      "Collaboration finder",
      "All Silver benefits"
    ],
    icon: Award
  },
  {
    tier: "platinum_star",
    name: "Platinum Star",
    color: "from-gray-300 to-gray-400",
    textColor: "text-gray-200",
    borderColor: "border-gray-300/30",
    requirements: {
      fans: 5000,
      referrals: 50,
      quality: 80,
      posts: 500,
    },
    benefits: [
      "Priority AI processing",
      "Custom AI models",
      "API access for integrations",
      "Dedicated account manager",
      "All Gold benefits"
    ],
    icon: Crown
  },
  {
    tier: "diamond_star",
    name: "Diamond Star",
    color: "from-slate-400 to-slate-500",
    textColor: "text-cyan-300",
    borderColor: "border-slate-400/30",
    requirements: {
      fans: 25000,
      referrals: 100,
      quality: 90,
      posts: 1000,
    },
    benefits: [
      "All platform features unlocked",
      "Beta access to new tools",
      "24/7 dedicated support",
      "Custom integrations",
      "VIP treatment & recognition",
      "All Platinum benefits"
    ],
    icon: Crown
  }
];

export default function StarzSignup() {
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505] text-white">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto relative">
            <div className="inline-flex items-center gap-2 bg-slate-500/10 border border-slate-500/30 rounded-full px-6 py-2 mb-6">
              <Zap className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-cyan-300 font-medium">Performance-Based Membership</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-['Bebas_Neue'] mb-6 bg-gradient-to-r from-slate-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wide">
              Earn Your Star Status
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 mb-8 leading-relaxed">
              Starz Studio is <strong className="text-white">not a paid membership</strong> — it's earned through performance.
              Build your fanbase, create quality content, and unlock powerful AI tools as you grow.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2">
                <Users className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-zinc-300">Fan Count</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-zinc-300">Referrals</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2">
                <Camera className="w-5 h-5 text-pink-400" />
                <span className="text-sm text-zinc-300">Media Quality</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-zinc-300">Post Volume</span>
              </div>
            </div>

            <Button
              asChild
              className="bg-gradient-to-r from-slate-500 to-purple-500 hover:from-slate-400 hover:to-purple-400 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-slate-500/30"
            >
              <Link href="/auth/signup">
                Start Your Creator Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-['Bebas_Neue'] text-center mb-4">How Starz Works</h2>
          <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto">
            Your tier is evaluated every 30 days based on your performance metrics.
            Titles change dynamically to keep momentum and reward consistent growth.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-zinc-900/50 border-slate-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">30-Day Rolling Period</h3>
                    <p className="text-zinc-400 text-sm">
                      Your tier is re-evaluated monthly. Stay active and engaged to maintain or upgrade your status.
                      Inactive creators may see tier adjustments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Dynamic Titles</h3>
                    <p className="text-zinc-400 text-sm">
                      Your title reflects your current performance tier. As you grow and improve,
                      your title updates to match — keeping the momentum fresh and competitive.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-pink-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pink-500/10 rounded-lg">
                    <Camera className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">AI Quality Scoring</h3>
                    <p className="text-zinc-400 text-sm">
                      Your media uploads are scored by FanzMediaHub AI for quality, composition,
                      and engagement potential. Higher quality = higher tier progress.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-yellow-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Fan & Referral Growth</h3>
                    <p className="text-zinc-400 text-sm">
                      Build your fanbase through engaging content and successful referrals.
                      Both metrics contribute to your tier evaluation and unlock new benefits.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Info */}
          <div className="bg-gradient-to-r from-slate-500/10 to-purple-500/10 border border-slate-500/30 rounded-xl p-6 mb-12">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Starz Program Rules</h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Membership cannot be purchased — only earned through platform performance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Tiers are evaluated every 30 days based on rolling metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>All metrics must meet minimum requirements to maintain or upgrade tier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Violating platform policies may result in tier demotion or removal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Higher tiers unlock exclusive AI tools, priority support, and VIP treatment</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Breakdown Section */}
      <div className="container mx-auto px-4 py-16 bg-gradient-to-b from-transparent via-zinc-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-['Bebas_Neue'] text-center mb-4">Starz Tiers & Benefits</h2>
          <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto">
            Five performance-based tiers, each unlocking powerful tools and benefits to grow your creator business.
          </p>

          <div className="space-y-4">
            {tierData.map((tier) => {
              const Icon = tier.icon;
              const isExpanded = expandedTier === tier.tier;

              return (
                <Card
                  key={tier.tier}
                  className={`bg-zinc-900/50 border ${tier.borderColor} backdrop-blur-sm transition-all cursor-pointer hover:border-opacity-60`}
                  onClick={() => setExpandedTier(isExpanded ? null : tier.tier)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-gradient-to-br ${tier.color} rounded-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-2xl font-['Bebas_Neue'] ${tier.textColor}`}>{tier.name}</h3>
                          <p className="text-sm text-zinc-500">Click to view requirements & benefits</p>
                        </div>
                      </div>
                      <ArrowRight className={`w-5 h-5 text-zinc-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-zinc-800">
                        {/* Requirements */}
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-4">Requirements</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                              <span className="text-sm text-zinc-400">Minimum Fans</span>
                              <Badge variant="outline" className={`${tier.textColor} border-current`}>
                                {tier.requirements.fans.toLocaleString()}+
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                              <span className="text-sm text-zinc-400">Successful Referrals</span>
                              <Badge variant="outline" className={`${tier.textColor} border-current`}>
                                {tier.requirements.referrals}+
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                              <span className="text-sm text-zinc-400">Media Quality Score</span>
                              <Badge variant="outline" className={`${tier.textColor} border-current`}>
                                {tier.requirements.quality}/100
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                              <span className="text-sm text-zinc-400">Total Posts</span>
                              <Badge variant="outline" className={`${tier.textColor} border-current`}>
                                {tier.requirements.posts}+
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Benefits */}
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-4">Benefits Unlocked</h4>
                          <ul className="space-y-2">
                            {tier.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.textColor}`} />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-500/20 via-purple-500/20 to-pink-500/20 border border-slate-500/30 rounded-2xl p-8 md:p-12">
            <Crown className="w-16 h-16 text-slate-400 mx-auto mb-6" />
            <h2 className="text-4xl font-['Bebas_Neue'] mb-4">Ready to Earn Your Stars?</h2>
            <p className="text-zinc-400 mb-8 text-lg">
              Create your creator account and start building your fanbase.
              Your Starz tier will be automatically evaluated as you grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-slate-500 to-purple-500 hover:from-slate-400 hover:to-purple-400 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-slate-500/30"
              >
                <Link href="/auth/signup">
                  Start as Creator
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-zinc-700 hover:bg-zinc-800 px-8 py-6 text-lg rounded-full"
              >
                <Link href="/auth/login">
                  Already Have Account?
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="container mx-auto px-4 pb-16">
        <p className="text-center text-sm text-zinc-600">
          Questions about Starz membership? <Link href="/contact" className="text-slate-400 hover:underline">Contact Support</Link>
        </p>
      </div>

    </div>
  );
}
