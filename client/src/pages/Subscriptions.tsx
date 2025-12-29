import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import {
  Star,
  Crown,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Skull,
  Flame,
  Zap,
  Shield,
  Eye,
  Heart,
  Target,
  RefreshCw
} from 'lucide-react';

interface Subscription {
  id: string;
  creatorId: string;
  tier: string;
  pricePerMonth: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'cancelled' | 'expired';
  autoRenew: boolean;
  creator: {
    username: string;
    profileImageUrl?: string;
    isVerified: boolean;
    followerCount: number;
  };
}

export default function Subscriptions() {
  const { user } = useAuth();

  const { data: subscriptions = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ['/api/subscriptions'],
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-400/50';
      case 'cancelled': return 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-yellow-400/50';
      case 'expired': return 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-400/50';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-10 bg-gradient-to-r from-red-950/50 to-orange-950/50 rounded-xl w-64 mb-4" />
            <div className="h-6 bg-gray-800/50 rounded w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-gradient-to-br from-gray-900 to-black border-gray-800/50">
                <CardContent className="p-6">
                  <div className="h-8 bg-gray-800 rounded w-20 mb-4" />
                  <div className="h-6 bg-gray-700 rounded w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-gradient-to-br from-gray-900 to-black border-gray-800/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 bg-gray-800 rounded-full" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-700 rounded mb-2 w-32" />
                      <div className="h-4 bg-gray-800 rounded w-24" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const inactiveSubscriptions = subscriptions.filter(sub => sub.status !== 'active');
  const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => sum + sub.pricePerMonth, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" data-testid="subscriptions-page">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-black to-orange-950/80 border border-red-500/20 p-8 mb-8">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 opacity-10">
          <Crown className="h-48 w-48 text-yellow-500" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl shadow-lg shadow-yellow-500/30">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 mb-1" data-testid="page-title">
              Your Empire
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your creator subscriptions and access premium content
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-950/40 via-black to-emerald-950/40 border-2 border-green-500/30 overflow-hidden group hover:border-green-400/50 transition-all">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <Crown className="h-20 w-20 text-green-400" />
            </div>
            <div className="relative z-10">
              <p className="text-sm text-gray-400 uppercase tracking-wide font-bold mb-2">Active Subscriptions</p>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400" data-testid="active-count">
                {activeSubscriptions.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-950/40 via-black to-orange-950/40 border-2 border-yellow-500/30 overflow-hidden group hover:border-yellow-400/50 transition-all">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="h-20 w-20 text-yellow-400" />
            </div>
            <div className="relative z-10">
              <p className="text-sm text-gray-400 uppercase tracking-wide font-bold mb-2">Monthly Burn</p>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400" data-testid="monthly-spend">
                {formatCurrency(totalMonthlySpend)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-950/40 via-black to-orange-950/40 border-2 border-red-500/30 overflow-hidden group hover:border-red-400/50 transition-all">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="h-20 w-20 text-red-400" />
            </div>
            <div className="relative z-10">
              <p className="text-sm text-gray-400 uppercase tracking-wide font-bold mb-2">Total Creators</p>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400" data-testid="total-creators">
                {subscriptions.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="text-center py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800/50">
          <CardContent>
            <div className="space-y-6">
              <div className="p-8 bg-gradient-to-br from-red-950/30 to-orange-950/30 rounded-full w-fit mx-auto">
                <Skull className="h-20 w-20 text-red-400/50" />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase tracking-wide text-white mb-3">
                  No Subscriptions Yet
                </h3>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                  Subscribe to your favorite creators to unlock exclusive content and perks
                </p>
                <Link href="/search">
                  <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold uppercase tracking-wide text-lg px-8 py-6 shadow-lg shadow-red-500/25" data-testid="find-creators-button">
                    <Target className="h-5 w-5 mr-2" />
                    Hunt for Creators
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* Active Subscriptions */}
          {activeSubscriptions.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-lg shadow-green-500/30">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  Active Subscriptions
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent" />
              </div>

              <div className="space-y-4">
                {activeSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-green-500/20 hover:border-green-400/40 transition-all duration-300 overflow-hidden group" data-testid={`subscription-${subscription.id}`}>
                    <CardHeader className="pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Link href={`/creator/${subscription.creatorId}`}>
                            <div className="relative">
                              <Avatar className="h-16 w-16 cursor-pointer ring-4 ring-green-500/30 group-hover:ring-green-400/50 transition-all">
                                <AvatarImage src={subscription.creator.profileImageUrl} />
                                <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white text-xl font-black">
                                  {subscription.creator.username[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {subscription.creator.isVerified && (
                                <div className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full border-2 border-black">
                                  <Shield className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                          </Link>

                          <div className="flex-1">
                            <Link href={`/creator/${subscription.creatorId}`}>
                              <div className="flex items-center gap-2 cursor-pointer group-hover:text-green-400 transition-colors">
                                <h3 className="text-xl font-black uppercase tracking-wide text-white" data-testid={`creator-name-${subscription.id}`}>
                                  {subscription.creator.username}
                                </h3>
                                {subscription.creator.isVerified && (
                                  <Shield className="h-5 w-5 text-green-400" />
                                )}
                              </div>
                            </Link>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                              <span className="px-2 py-0.5 bg-gradient-to-r from-red-950/50 to-orange-950/50 rounded border border-red-500/20 text-red-300 font-bold uppercase text-xs">
                                {subscription.tier} Tier
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-gray-500" />
                                {subscription.creator.followerCount.toLocaleString()} followers
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                            {formatCurrency(subscription.pricePerMonth)}
                            <span className="text-sm text-gray-500 font-normal">/mo</span>
                          </div>
                          <Badge className={getStatusColor(subscription.status)}>
                            <Flame className="h-3 w-3 mr-1" />
                            {subscription.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 rounded-lg border border-gray-800">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>Started {formatDate(subscription.startDate)}</span>
                          </div>
                          {subscription.autoRenew && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-950/30 rounded-lg border border-green-500/20 text-green-400">
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span className="font-bold uppercase">Auto-renew</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/creator/${subscription.creatorId}`}>
                            <Button variant="outline" size="sm" className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-400/50 font-bold uppercase tracking-wide" data-testid={`view-creator-${subscription.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:bg-gray-800 font-bold uppercase tracking-wide" data-testid={`manage-${subscription.id}`}>
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Subscriptions */}
          {inactiveSubscriptions.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg">
                  <Skull className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-wide text-gray-400">
                  Past Subscriptions
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent" />
              </div>

              <div className="space-y-4">
                {inactiveSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="bg-gradient-to-br from-gray-900/50 via-black/50 to-gray-900/50 border border-gray-800/50 opacity-60 hover:opacity-80 transition-all" data-testid={`past-subscription-${subscription.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-gray-700">
                            <AvatarImage src={subscription.creator.profileImageUrl} />
                            <AvatarFallback className="bg-gray-800 text-gray-400 font-bold">
                              {subscription.creator.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <h3 className="font-bold text-gray-300">{subscription.creator.username}</h3>
                            <p className="text-sm text-gray-500">{subscription.tier} Tier</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status.toUpperCase()}
                          </Badge>
                          {subscription.endDate && (
                            <p className="text-xs text-gray-600 mt-1">
                              Ended {formatDate(subscription.endDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
