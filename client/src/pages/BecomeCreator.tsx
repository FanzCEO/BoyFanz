// @ts-nocheck
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Compliance2257Form from "@/components/compliance/Compliance2257Form";
import {
  Star,
  DollarSign,
  Users,
  Video,
  MessageCircle,
  Shield,
  TrendingUp,
  Gift,
  Zap,
  CheckCircle,
  ArrowRight,
  Heart,
  PawPrint
} from "lucide-react";

export default function BecomeCreator() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showCompliance, setShowCompliance] = useState(false);

  // If user is already a creator, redirect to dashboard
  if (user?.role === 'creator') {
    setLocation('/dashboard');
    return null;
  }

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Money",
      description: "Set your own subscription prices and earn from tips, PPV, and custom content"
    },
    {
      icon: Users,
      title: "Build Your Fanbase",
      description: "Connect with fans who appreciate your unique content and personality"
    },
    {
      icon: Video,
      title: "Live Streaming",
      description: "Go live anytime with our advanced streaming tools and earn tips in real-time"
    },
    {
      icon: MessageCircle,
      title: "Direct Messaging",
      description: "Engage with fans through private messages and mass messaging campaigns"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track your growth, earnings, and engagement with detailed analytics"
    },
    {
      icon: Gift,
      title: "Custom Content",
      description: "Fulfill custom requests from fans at premium prices you set"
    },
    {
      icon: Shield,
      title: "Content Protection",
      description: "DRM protection, watermarking, and DMCA takedown services included"
    },
    {
      icon: Zap,
      title: "Instant Payouts",
      description: "Get paid fast with multiple payout options including crypto"
    }
  ];

  const handleComplianceComplete = () => {
    // Compliance form handles the API call and role update
    setLocation('/dashboard');
  };

  if (showCompliance) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowCompliance(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Overview
            </Button>
          </div>

          <Card className="glass-card border-red-900/30">
            <CardHeader>
              <CardTitle className="font-bebas text-3xl text-red-500 neon-glow-red flex items-center gap-3">
                <Shield className="w-8 h-8" />
                18 U.S.C. 2257 Compliance Verification
              </CardTitle>
              <CardDescription className="text-lg">
                Federal law requires all adult content creators to complete this verification.
                Your information is securely stored and only used for compliance purposes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Compliance2257Form onComplete={handleComplianceComplete} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-16 px-4 text-center bg-gradient-to-b from-red-950/50 to-background">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/20 border border-gold-500/40 mb-6">
            <Star className="w-5 h-5 text-gold-500" />
            <span className="text-gold-500 font-semibold">Creator Program</span>
          </div>

          <h1 className="font-bebas text-5xl md:text-7xl text-white mb-4">
            <span className="text-red-500 neon-glow-red">BECOME</span> A CREATOR
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Turn your passion into profit. Share exclusive content with dedicated fans
            and build your own community on your terms.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              size="lg"
              className="glass-button-neon text-lg px-8 py-6"
              onClick={() => setShowCompliance(true)}
            >
              <Star className="w-5 h-5 mr-2" />
              Start Verification Process
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Keep 100% of Earnings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Daily Payouts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>We Charge Fans, Not You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-bebas text-4xl text-center text-gold-500 mb-12">
          WHY CREATORS LOVE US
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="glass-card border-red-900/20 hover:border-red-500/40 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/20 mb-4 group-hover:bg-red-500/30 transition-colors">
                  <benefit.icon className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="font-bebas text-xl text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Earnings Potential */}
      <div className="bg-gradient-to-r from-red-950/30 via-background to-red-950/30 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bebas text-4xl text-gold-500 mb-6">
            YOUR EARNING POTENTIAL
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="p-6 rounded-xl bg-background/50 border border-red-900/30">
              <p className="text-4xl font-bold text-red-500 mb-2">80%</p>
              <p className="text-muted-foreground">Industry-leading creator payout</p>
            </div>
            <div className="p-6 rounded-xl bg-background/50 border border-gold-500/30">
              <p className="text-4xl font-bold text-gold-500 mb-2">24/7</p>
              <p className="text-muted-foreground">Creator support available</p>
            </div>
            <div className="p-6 rounded-xl bg-background/50 border border-red-900/30">
              <p className="text-4xl font-bold text-red-500 mb-2">You</p>
              <p className="text-muted-foreground">Set your own prices & schedule</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-8">
            Your success depends on your content, engagement, and dedication.
            We provide all the tools - you bring the talent!
          </p>

          <Button
            size="lg"
            className="glass-button-neon text-lg px-8"
            onClick={() => setShowCompliance(true)}
          >
            <Star className="w-5 h-5 mr-2" />
            Begin Your Creator Journey
          </Button>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-bebas text-4xl text-center text-white mb-8">
          REQUIREMENTS TO JOIN
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Age Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Must be 18+ years old with valid government-issued ID
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">2257 Compliance</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete federal 18 U.S.C. 2257 record-keeping requirements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Banking Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Valid payment method for receiving your earnings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Content Guidelines</h3>
                  <p className="text-sm text-muted-foreground">
                    Agree to our content policies and community guidelines
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* The Wittle Bear Foundation Section */}
      <div className="py-16 px-4 bg-gradient-to-br from-pink-950/20 via-background to-amber-950/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <PawPrint className="h-8 w-8 text-pink-400" />
              <Heart className="h-6 w-6 text-pink-500 fill-pink-500 animate-pulse" />
              <PawPrint className="h-8 w-8 text-pink-400 transform scale-x-[-1]" />
            </div>
            <h2 className="font-bebas text-3xl md:text-4xl mb-2">
              <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">
                The Wittle Bear Foundation
              </span>
            </h2>
            <p className="text-pink-200/70 italic">In loving memory of Wittle Bear</p>
          </div>

          <Card className="glass-card border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-amber-500/5">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <Heart className="h-8 w-8 text-pink-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-pink-300 mb-2">Supporting LGBTQ+ Youth</h3>
                  <p className="text-sm text-muted-foreground">
                    Providing shelter and resources to homeless LGBTQ+ youth who face rejection.
                  </p>
                </div>
                <div className="text-center">
                  <PawPrint className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-amber-300 mb-2">Rescuing Shelter Animals</h3>
                  <p className="text-sm text-muted-foreground">
                    Helping shelter animals find their forever homes.
                  </p>
                </div>
              </div>
              <div className="text-center border-t border-pink-500/20 pt-6">
                <p className="text-muted-foreground mb-2">
                  <span className="text-pink-300 font-semibold">A large portion of our profits</span> goes directly to the foundation.
                </p>
                <p className="text-sm text-pink-300/60 flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                  Because no one should ever feel alone or unwanted
                  <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center py-16 px-4 bg-gradient-to-t from-red-950/30 to-background">
        <h2 className="font-bebas text-4xl text-white mb-4">
          READY TO START EARNING?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          The verification process takes only 10-15 minutes.
          Once approved, you can start posting content immediately!
        </p>
        <Button
          size="lg"
          className="glass-button-neon text-xl px-12 py-6"
          onClick={() => setShowCompliance(true)}
        >
          <Star className="w-6 h-6 mr-2" />
          BECOME A CREATOR NOW
        </Button>
      </div>
    </div>
  );
}
