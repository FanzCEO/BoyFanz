import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy, Share2, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Referrals() {
  const { toast } = useToast();
  const referralLink = "https://boyfanz.com/ref/yourcode";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground">Earn by inviting creators and fans</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Fans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">$0.00</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link to earn commissions on referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono" />
            <Button onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Share Your Link</h3>
              <p className="text-sm text-muted-foreground">Share your unique referral link with potential creators and fans</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. They Sign Up</h3>
              <p className="text-sm text-muted-foreground">When someone joins using your link, they become your referral</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Earn Commissions</h3>
              <p className="text-sm text-muted-foreground">Earn 5% of their earnings for 12 months</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
