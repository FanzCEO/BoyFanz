import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, Calendar, Percent, Users, Zap } from 'lucide-react';

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
  const { data: breakdown, isLoading: breakdownLoading } = useQuery<EarningsBreakdown>({
    queryKey: ['/api/earnings/breakdown'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<EarningsStats>({
    queryKey: ['/api/earnings/stats'],
  });

  if (breakdownLoading || statsLoading) {
    return (
      <div className=\"flex items-center justify-center min-h-screen\">
        <div className=\"animate-spin rounded-full h-32 w-32 border-b-2 border-primary\"></div>
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
    <div className=\"container mx-auto px-4 py-8 space-y-8\" data-testid=\"earnings-page\">
      {/* Header */}
      <div className=\"space-y-4\">
        <h1 className=\"text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent\">
          💰 Earnings Dashboard
        </h1>
        <p className=\"text-muted-foreground text-lg\">
          100% creator earnings program - no platform fees, full transparency
        </p>
      </div>

      {/* Key Metrics */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
        <Card className=\"bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20\" data-testid=\"card-available-balance\">
          <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
            <CardTitle className=\"text-sm font-medium text-green-400\">Available Balance</CardTitle>
            <DollarSign className=\"h-4 w-4 text-green-400\" />
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold text-green-400\" data-testid=\"text-available-balance\">
              {formatCurrency(breakdown?.availableBalance || 0)}
            </div>
            <p className=\"text-xs text-muted-foreground\">Ready for payout</p>
          </CardContent>
        </Card>

        <Card className=\"bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20\" data-testid=\"card-total-earnings\">
          <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
            <CardTitle className=\"text-sm font-medium text-blue-400\">Total Earnings</CardTitle>
            <TrendingUp className=\"h-4 w-4 text-blue-400\" />
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold text-blue-400\" data-testid=\"text-total-earnings\">
              {formatCurrency(breakdown?.grossEarnings || 0)}
            </div>
            <p className=\"text-xs text-muted-foreground\">All-time gross</p>
          </CardContent>
        </Card>

        <Card className=\"bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20\" data-testid=\"card-monthly-earnings\">
          <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
            <CardTitle className=\"text-sm font-medium text-purple-400\">This Month</CardTitle>
            <Calendar className=\"h-4 w-4 text-purple-400\" />
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold text-purple-400\" data-testid=\"text-monthly-earnings\">
              {formatCurrency(stats?.monthlyEarnings || 0)}
            </div>
            <p className=\"text-xs text-muted-foreground\">Monthly revenue</p>
          </CardContent>
        </Card>

        <Card className=\"bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20\" data-testid=\"card-transactions\">
          <CardHeader className=\"flex flex-row items-center justify-between space-y-0 pb-2\">
            <CardTitle className=\"text-sm font-medium text-amber-400\">Transactions</CardTitle>
            <Zap className=\"h-4 w-4 text-amber-400\" />
          </CardHeader>
          <CardContent>
            <div className=\"text-2xl font-bold text-amber-400\" data-testid=\"text-transaction-count\">
              {stats?.transactionCount || 0}
            </div>
            <p className=\"text-xs text-muted-foreground\">Total transactions</p>
          </CardContent>
        </Card>
      </div>\n\n      {/* 100% Earnings Program Info */}\n      <Card className=\"bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30\" data-testid=\"card-earnings-program\">\n        <CardHeader>\n          <CardTitle className=\"flex items-center gap-2 text-emerald-400\">\n            <Percent className=\"h-5 w-5\" />\n            100% Creator Earnings Program\n          </CardTitle>\n          <CardDescription className=\"text-emerald-300\">\n            BoyFanz takes 0% platform fees - creators keep 100% of their earnings\n          </CardDescription>\n        </CardHeader>\n        <CardContent className=\"space-y-4\">\n          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">\n            <div className=\"text-center p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20\">\n              <div className=\"text-2xl font-bold text-emerald-400\">0%</div>\n              <p className=\"text-sm text-muted-foreground\">BoyFanz Platform Fee</p>\n            </div>\n            <div className=\"text-center p-4 bg-blue-500/5 rounded-lg border border-blue-500/20\">\n              <div className=\"text-2xl font-bold text-blue-400\">2.9%</div>\n              <p className=\"text-sm text-muted-foreground\">Payment Processor Fee</p>\n            </div>\n            <div className=\"text-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/20\">\n              <div className=\"text-2xl font-bold text-amber-400\">97.1%</div>\n              <p className=\"text-sm text-muted-foreground\">Your Take-Home</p>\n            </div>\n          </div>\n          \n          <Separator className=\"bg-emerald-500/20\" />\n          \n          <div className=\"flex justify-between items-center\">\n            <span className=\"text-sm font-medium\">Transparency Promise:</span>\n            <Badge variant=\"outline\" className=\"border-emerald-500/50 text-emerald-400\">\n              Full Disclosure\n            </Badge>\n          </div>\n        </CardContent>\n      </Card>\n\n      {/* Earnings Breakdown */}\n      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">\n        <Card data-testid=\"card-fee-breakdown\">\n          <CardHeader>\n            <CardTitle className=\"flex items-center gap-2\">\n              <DollarSign className=\"h-5 w-5\" />\n              Fee Breakdown\n            </CardTitle>\n            <CardDescription>\n              Transparent breakdown of all fees and earnings\n            </CardDescription>\n          </CardHeader>\n          <CardContent className=\"space-y-4\">\n            <div className=\"space-y-3\">\n              <div className=\"flex justify-between items-center\">\n                <span className=\"text-sm\">Gross Earnings</span>\n                <span className=\"font-semibold\" data-testid=\"text-gross-earnings\">\n                  {formatCurrency(breakdown?.grossEarnings || 0)}\n                </span>\n              </div>\n              \n              <div className=\"flex justify-between items-center text-emerald-400\">\n                <span className=\"text-sm\">BoyFanz Platform Fee (0%)</span>\n                <span className=\"font-semibold\" data-testid=\"text-platform-fee\">\n                  {formatCurrency(breakdown?.feeBreakdown.boyfanzFee || 0)}\n                </span>\n              </div>\n              \n              <div className=\"flex justify-between items-center text-blue-400\">\n                <span className=\"text-sm\">Payment Processor Fee</span>\n                <span className=\"font-semibold\" data-testid=\"text-processor-fee\">\n                  {formatCurrency(breakdown?.feeBreakdown.processorFee || 0)}\n                </span>\n              </div>\n              \n              <Separator />\n              \n              <div className=\"flex justify-between items-center text-lg font-bold text-primary\">\n                <span>Net Earnings</span>\n                <span data-testid=\"text-net-earnings\">\n                  {formatCurrency(breakdown?.netEarnings || 0)}\n                </span>\n              </div>\n            </div>\n            \n            <div className=\"space-y-2\">\n              <div className=\"flex justify-between text-sm\">\n                <span>Your Retention Rate</span>\n                <span className=\"font-semibold text-emerald-400\">97.1%</span>\n              </div>\n              <Progress \n                value={97.1} \n                className=\"h-2\" \n                data-testid=\"progress-retention-rate\"\n              />\n            </div>\n          </CardContent>\n        </Card>\n\n        <Card data-testid=\"card-recent-activity\">\n          <CardHeader>\n            <CardTitle className=\"flex items-center gap-2\">\n              <Users className=\"h-5 w-5\" />\n              Earnings Timeline\n            </CardTitle>\n            <CardDescription>\n              Your earnings performance over time\n            </CardDescription>\n          </CardHeader>\n          <CardContent className=\"space-y-4\">\n            <div className=\"grid grid-cols-1 gap-3\">\n              <div className=\"flex justify-between items-center p-3 bg-muted/20 rounded-lg\">\n                <div>\n                  <p className=\"text-sm font-medium\">Today</p>\n                  <p className=\"text-xs text-muted-foreground\">Daily earnings</p>\n                </div>\n                <div className=\"text-right\">\n                  <p className=\"font-semibold\" data-testid=\"text-daily-earnings\">\n                    {formatCurrency(stats?.dailyEarnings || 0)}\n                  </p>\n                </div>\n              </div>\n              \n              <div className=\"flex justify-between items-center p-3 bg-muted/20 rounded-lg\">\n                <div>\n                  <p className=\"text-sm font-medium\">This Week</p>\n                  <p className=\"text-xs text-muted-foreground\">Weekly earnings</p>\n                </div>\n                <div className=\"text-right\">\n                  <p className=\"font-semibold\" data-testid=\"text-weekly-earnings\">\n                    {formatCurrency(stats?.weeklyEarnings || 0)}\n                  </p>\n                </div>\n              </div>\n              \n              <div className=\"flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20\">\n                <div>\n                  <p className=\"text-sm font-medium text-primary\">This Month</p>\n                  <p className=\"text-xs text-primary/70\">Monthly earnings</p>\n                </div>\n                <div className=\"text-right\">\n                  <p className=\"font-semibold text-primary\">\n                    {formatCurrency(stats?.monthlyEarnings || 0)}\n                  </p>\n                </div>\n              </div>\n            </div>\n          </CardContent>\n        </Card>\n      </div>\n\n      {/* Call to Action */}\n      <Card className=\"bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30\" data-testid=\"card-cta\">\n        <CardContent className=\"p-6\">\n          <div className=\"text-center space-y-4\">\n            <h3 className=\"text-xl font-bold\">Ready to Start Earning?</h3>\n            <p className=\"text-muted-foreground\">\n              Join thousands of creators earning 100% of their revenue on BoyFanz\n            </p>\n            <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">\n              <button \n                className=\"px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors\"\n                data-testid=\"button-upload-content\"\n              >\n                Upload Content\n              </button>\n              <button \n                className=\"px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors\"\n                data-testid=\"button-request-payout\"\n              >\n                Request Payout\n              </button>\n            </div>\n          </div>\n        </CardContent>\n      </Card>\n    </div>\n  );\n}