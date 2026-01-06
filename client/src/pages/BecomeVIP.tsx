import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'wouter';
import {
  Crown,
  Star,
  Zap,
  Shield,
  MessageCircle,
  TrendingUp,
  Gift,
  Sparkles,
  Check
} from "lucide-react";

export default function BecomeVIP() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Crown className="h-12 w-12 text-warning" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-warning via-amber-400 to-warning bg-clip-text text-transparent mb-4">
            Become a VIP
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock exclusive features, priority support, and premium benefits on BoyFanz
          </p>
          <Badge variant="default" className="mt-4 bg-warning text-warning-foreground">
            Limited Enrollment
          </Badge>
        </div>

        {/* Benefits Overview */}
        <Card className="mb-8 border-warning/20 bg-gradient-to-br from-warning/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-warning" />
              VIP Membership Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-warning mt-1" />
              <div>
                <h4 className="font-semibold text-foreground">Exclusive Badge</h4>
                <p className="text-sm text-muted-foreground">Stand out with a VIP badge on your profile</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-warning mt-1" />
              <div>
                <h4 className="font-semibold text-foreground">Priority Support</h4>
                <p className="text-sm text-muted-foreground">24/7 dedicated VIP support team</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-warning mt-1" />
              <div>
                <h4 className="font-semibold text-foreground">Increased Visibility</h4>
                <p className="text-sm text-muted-foreground">Boosted profile ranking in searches</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-warning mt-1" />
              <div>
                <h4 className="font-semibold text-foreground">Priority Messages</h4>
                <p className="text-sm text-muted-foreground">Your messages appear at the top for creators</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-warning mt-1" />
              <div>
                <h4 className="font-semibold text-foreground">Early Access</h4>
                <p className="text-sm text-muted-foreground">First access to new features and content</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-warning mt-1" />
              <div>
                <h4 className="font-semibold text-foreground">Exclusive Perks</h4>
                <p className="text-sm text-muted-foreground">Special discounts and bonus content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* For Fans */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              VIP for Fans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>As a VIP fan, you'll enjoy:</p>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">VIP Badge & Profile Frame</h4>
                  <p>Exclusive golden badge and animated profile frame</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Priority Access to Creators</h4>
                  <p>Your messages, comments, and requests are highlighted</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">10% Discount on Subscriptions</h4>
                  <p>Save on all creator subscriptions</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Exclusive Content Access</h4>
                  <p>VIP-only posts and livestreams from participating creators</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Early Notification System</h4>
                  <p>Get notified before everyone else when creators post</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* For Creators */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              VIP for Creators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>As a VIP creator, you'll unlock:</p>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Premium Profile Badge</h4>
                  <p>Stand out with an exclusive verified VIP creator badge</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Higher Search Rankings</h4>
                  <p>Appear higher in search results and recommendations</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Advanced Analytics</h4>
                  <p>Deep insights into your audience and revenue</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Priority Payouts</h4>
                  <p>Faster payout processing (1-2 business days)</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Lower Platform Fees</h4>
                  <p>Earn 90% revenue share instead of 85%</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Dedicated Account Manager</h4>
                  <p>Personal support and growth consultation</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Featured Placement</h4>
                  <p>Regular featuring on homepage and category pages</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="mb-6 border-warning/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              VIP Membership Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">Monthly VIP</h4>
                <p className="text-3xl font-bold text-warning mb-2">$29.99</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>

              <div className="border border-warning rounded-lg p-4 relative">
                <Badge className="absolute -top-2 right-2 bg-warning text-warning-foreground">
                  Most Popular
                </Badge>
                <h4 className="font-bold text-lg mb-2">Annual VIP</h4>
                <p className="text-3xl font-bold text-warning mb-2">$299.99</p>
                <p className="text-sm text-muted-foreground">per year</p>
                <p className="text-xs text-success mt-2">Save $60 annually</p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">Lifetime VIP</h4>
                <p className="text-3xl font-bold text-warning mb-2">$999.99</p>
                <p className="text-sm text-muted-foreground">one-time payment</p>
                <p className="text-xs text-success mt-2">Best value!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Join */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How to Become a VIP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Choose your VIP membership tier (Monthly, Annual, or Lifetime)</li>
              <li>Complete secure payment checkout</li>
              <li>Your VIP status activates immediately</li>
              <li>Start enjoying exclusive benefits right away</li>
            </ol>

            <div className="flex gap-4 mt-6">
              <Link href="/settings">
                <Button size="lg" className="bg-warning hover:bg-warning/90 text-warning-foreground">
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade to VIP Now
                </Button>
              </Link>
              <Link href="/help">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground">Can I cancel my VIP membership?</h4>
              <p>Yes, you can cancel anytime. You'll retain VIP access until the end of your billing period.</p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground">Is VIP worth it for new creators?</h4>
              <p>
                Absolutely! VIP features help new creators grow faster with increased visibility and
                priority placement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground">Do I get a refund if I upgrade to annual?</h4>
              <p>
                Yes, if you're currently on monthly VIP, the remaining value will be credited toward
                your annual upgrade.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground">What happens if my VIP expires?</h4>
              <p>
                Your account returns to standard features. You can re-activate VIP at any time to
                restore benefits.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          <h3 className="text-2xl font-bold mb-4">Ready to elevate your BoyFanz experience?</h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of VIP members enjoying exclusive benefits today
          </p>
          <Link href="/settings">
            <Button size="lg" className="bg-warning hover:bg-warning/90 text-warning-foreground">
              <Crown className="h-5 w-5 mr-2" />
              Become a VIP Member
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
