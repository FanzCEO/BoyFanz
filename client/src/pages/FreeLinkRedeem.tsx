import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Gift,
  Clock,
  User,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Calendar,
  Star,
} from 'lucide-react';

interface FreeLinkInfo {
  id: string;
  name: string;
  description: string | null;
  freeDays: number;
  status: 'active' | 'paused' | 'expired' | 'depleted';
  expiresAt: string | null;
  newSubscribersOnly: boolean;
  creator: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string | null;
  };
  remainingRedemptions: number | null;
}

interface RedemptionResult {
  success: boolean;
  freeAccessEndsAt: string;
  freeDays: number;
  creatorId: string;
  message: string;
}

export default function FreeLinkRedeem() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/free/:slug');
  const slug = params?.slug;
  const [hasRedeemed, setHasRedeemed] = useState(false);
  const [redemptionData, setRedemptionData] = useState<RedemptionResult | null>(null);

  // Fetch free link info
  const { data: linkInfo, isLoading, error } = useQuery<FreeLinkInfo>({
    queryKey: ['/api/free-links', slug],
    enabled: !!slug,
  });

  // Redeem mutation
  const redeemMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/free-links/${slug}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ source: 'direct_link' }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to redeem');
      }
      return response.json();
    },
    onSuccess: (data: RedemptionResult) => {
      setHasRedeemed(true);
      setRedemptionData(data);
      toast({
        title: 'Success!',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleRedeem = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      setLocation(`/login?redirect=/free/${slug}`);
      return;
    }
    redeemMutation.mutate();
  };

  const getStatusMessage = () => {
    if (!linkInfo) return null;

    switch (linkInfo.status) {
      case 'expired':
        return { icon: AlertCircle, text: 'This offer has expired', variant: 'destructive' };
      case 'depleted':
        return { icon: AlertCircle, text: 'All redemptions have been claimed', variant: 'destructive' };
      case 'paused':
        return { icon: AlertCircle, text: 'This offer is currently paused', variant: 'warning' };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading offer...</p>
        </div>
      </div>
    );
  }

  if (error || !linkInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold">Link Not Found</h2>
            <p className="text-muted-foreground">
              This free access link doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasRedeemed && redemptionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="max-w-md w-full border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-green-500/20 rounded-full animate-ping" />
              </div>
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto relative" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-green-400">Success!</h2>
              <p className="text-muted-foreground">
                You now have <span className="font-bold text-green-400">{redemptionData.freeDays} days</span> of free access!
              </p>
            </div>

            <Card className="bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Free until:</span>
                </div>
                <Badge className="bg-green-500/20 text-green-400">
                  {new Date(redemptionData.freeAccessEndsAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Badge>
              </div>
            </Card>

            <div className="space-y-3 pt-4">
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent"
                onClick={() => setLocation(`/@${linkInfo.creator.handle}`)}
              >
                <Star className="h-4 w-4 mr-2" />
                View {linkInfo.creator.displayName || linkInfo.creator.handle}'s Content
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation('/feed')}
              >
                Go to Feed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Card className="max-w-md w-full border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
            <Gift className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            <Sparkles className="inline h-5 w-5 text-amber-400 mr-2" />
            Free Access Offer
            <Sparkles className="inline h-5 w-5 text-amber-400 ml-2" />
          </CardTitle>
          <CardDescription className="text-lg">
            {linkInfo.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Creator Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            {linkInfo.creator.avatarUrl ? (
              <img
                src={linkInfo.creator.avatarUrl}
                alt={linkInfo.creator.displayName || linkInfo.creator.handle}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <div className="font-semibold text-lg">
                {linkInfo.creator.displayName || linkInfo.creator.handle}
              </div>
              <div className="text-sm text-muted-foreground">@{linkInfo.creator.handle}</div>
            </div>
          </div>

          {/* Offer Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-400" />
                <span>Free Access Duration</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 text-lg px-3 py-1">
                {linkInfo.freeDays} Days
              </Badge>
            </div>

            {linkInfo.description && (
              <p className="text-sm text-muted-foreground text-center px-4">
                {linkInfo.description}
              </p>
            )}

            {linkInfo.remainingRedemptions !== null && (
              <div className="text-center text-sm text-muted-foreground">
                <span className="text-amber-400 font-semibold">{linkInfo.remainingRedemptions}</span> redemptions remaining
              </div>
            )}

            {linkInfo.newSubscribersOnly && (
              <Badge variant="outline" className="w-full justify-center py-2">
                Available for new subscribers only
              </Badge>
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              statusMessage.variant === 'destructive' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              <statusMessage.icon className="h-5 w-5" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Expiry Warning */}
          {linkInfo.expiresAt && linkInfo.status === 'active' && (
            <div className="text-center text-sm text-amber-400">
              Offer expires {new Date(linkInfo.expiresAt).toLocaleDateString()}
            </div>
          )}

          {/* CTA */}
          {linkInfo.status === 'active' && (
            <Button
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 py-6 text-lg"
              onClick={handleRedeem}
              disabled={redeemMutation.isPending}
            >
              {redeemMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : isAuthenticated ? (
                <>
                  <Gift className="h-5 w-5 mr-2" />
                  Claim {linkInfo.freeDays} Days Free
                </>
              ) : (
                <>
                  <User className="h-5 w-5 mr-2" />
                  Sign In to Claim
                </>
              )}
            </Button>
          )}

          {/* Wallet Add */}
          {linkInfo.status === 'active' && (
            <div className="flex justify-center gap-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`/api/free-links/${slug}/wallet-pass?platform=apple`, '_blank')}
              >
                <Wallet className="h-4 w-4 mr-1" />
                Add to Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
