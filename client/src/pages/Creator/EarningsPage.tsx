import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, Calendar, Percent, Users, Zap, Heart, PawPrint, Sparkles } from 'lucide-react';

interface EarningsBreakdown {
  grossEarnings: number;
  platformFees: number;
  processorFees: number;
  netEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  feeBreakdown: {
    boyfanzFee: number;
    processorFee: number;
    taxWithholding?: number;
  };
}

interface EarningsStats {
  totalEarnings: number;
  platformFees: number;
  netEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  dailyEarnings: number;
  transactionCount: number;
  topEarningContent: Array<{
    mediaId: string;
    title: string;
    earnings: number;
  }>;
}

export default function EarningsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [donationPercent, setDonationPercent] = useState(0);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);

  const { data: breakdown, isLoading: breakdownLoading } = useQuery<EarningsBreakdown>({
    queryKey: ['/api/earnings/breakdown'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<EarningsStats>({
    queryKey: ['/api/earnings/stats'],
  });

  // Fetch current donation settings
  const { data: donationSettings } = useQuery<{ donationPercent: number }>({
    queryKey: ['/api/creator/donation-settings'],
  });

  // Update donation settings mutation
  const updateDonationMutation = useMutation({
    mutationFn: async (percent: number) => {
      const response = await fetch('/api/creator/donation-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationPercent: percent }),
      });
      if (!response.ok) throw new Error('Failed to save donation settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator/donation-settings'] });
      toast({
        title: "Donation preference saved",
        description: `${donationPercent}% of your earnings will go to The Wittle Bear Foundation`,
      });
      setIsDonationDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save donation preference. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Sync state with fetched settings
  useEffect(() => {
    if (donationSettings?.donationPercent !== undefined) {
      setDonationPercent(donationSettings.donationPercent);
    }
  }, [donationSettings?.donationPercent]);

  if (breakdownLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" data-testid="earnings-page">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          💰 Earnings Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          100% creator earnings program - no platform fees, full transparency
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20" data-testid="card-available-balance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400" data-testid="text-available-balance">
              {formatCurrency(breakdown?.availableBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Ready for payout</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20" data-testid="card-total-earnings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400" data-testid="text-total-earnings">
              {formatCurrency(breakdown?.grossEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All-time gross</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20" data-testid="card-monthly-earnings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400" data-testid="text-monthly-earnings">
              {formatCurrency(stats?.monthlyEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Monthly revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20" data-testid="card-transactions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-400">Transactions</CardTitle>
            <Zap className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400" data-testid="text-transaction-count">
              {stats?.transactionCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30" data-testid="card-earnings-program">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <Percent className="h-5 w-5" />
            100% Creator Earnings Program
          </CardTitle>
          <CardDescription className="text-emerald-300">
            BoyFanz takes 0% platform fees - creators keep 100% of their earnings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-400">0%</div>
              <p className="text-sm text-muted-foreground">BoyFanz Platform Fee</p>
            </div>
            <div className="text-center p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">2.9%</div>
              <p className="text-sm text-muted-foreground">Payment Processor Fee</p>
            </div>
            <div className="text-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
              <div className="text-2xl font-bold text-amber-400">97.1%</div>
              <p className="text-sm text-muted-foreground">Your Take-Home</p>
            </div>
          </div>

          <Separator className="bg-emerald-500/20" />

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Transparency Promise:</span>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
              Full Disclosure
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* The Wittle Bear Foundation - Creator Donation Settings */}
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-amber-500/5" data-testid="card-foundation-donation">
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
            <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
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
                    Choose what percentage of your earnings to donate to support homeless LGBTQ+ youth and shelter animals.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-pink-500 mb-2">
                      {donationPercent}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      of your earnings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={donationPercent}
                      onChange={(e) => setDonationPercent(Number(e.target.value))}
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
                        variant={donationPercent === percent ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDonationPercent(percent)}
                        className={donationPercent === percent ? "bg-pink-500 hover:bg-pink-600" : ""}
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Example: If you earn $100:</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You keep:</span>
                      <span className="font-medium">${(100 * (1 - donationPercent / 100)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your donation:</span>
                      <span className="font-medium text-pink-500">${(100 * donationPercent / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    The Wittle Bear Foundation supports homeless LGBTQ+ youth and
                    animals in shelters - because everyone deserves love, safety, and a home.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDonationDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => updateDonationMutation.mutate(donationPercent)}
                    disabled={updateDonationMutation.isPending}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {updateDonationMutation.isPending ? "Saving..." : "Save Preference"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-pink-400">
                <Heart className="h-5 w-5" />
                <span className="font-semibold">Supporting LGBTQ+ Youth</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Providing shelter, resources, and hope to homeless LGBTQ+ youth who face rejection from their families.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <PawPrint className="h-5 w-5" />
                <span className="font-semibold">Rescuing Shelter Animals</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Helping animals in shelters find loving forever homes because every creature deserves love.
              </p>
            </div>
          </div>

          <Separator className="my-6 bg-pink-500/20" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span className="text-sm font-medium">Your Current Donation:</span>
            </div>
            <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
              {donationSettings?.donationPercent || 0}% of earnings
            </Badge>
          </div>

          <div className="mt-4 p-4 bg-pink-500/5 border border-pink-500/20 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              <Heart className="inline h-4 w-4 text-pink-500 mr-1" />
              Plus, 30% of all ad revenue from your profile automatically goes to the foundation.
              You keep 100% of your subscription, tip, and PPV earnings - we never take a cut.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}