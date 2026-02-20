// FANZ Subscription Disclosure Component
// REQUIRED: Must be shown before ANY subscription purchase
// Legal compliance component - DO NOT REMOVE OR BYPASS

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Check,
  AlertTriangle,
  Info,
  ShieldCheck,
  Lock,
  DollarSign,
  MessageCircle,
  Star
} from "lucide-react";

interface ContentRatio {
  subscription: number;
  ppv: number;
  free: number;
}

interface SubscriptionDisclosureProps {
  creatorName: string;
  creatorId: number;
  contentRatio: ContentRatio;
  subscriptionPrice: number;
  isSubscriptionFriendly: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function SubscriptionDisclosure({
  creatorName,
  creatorId,
  contentRatio,
  subscriptionPrice,
  isSubscriptionFriendly,
  onAccept,
  onDecline
}: SubscriptionDisclosureProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [understoodPPV, setUnderstoodPPV] = useState(false);

  const canProceed = acknowledged && (contentRatio.ppv === 0 || understoodPPV);

  const getRatioColor = (ratio: number, type: 'subscription' | 'ppv') => {
    if (type === 'subscription') {
      if (ratio >= 90) return 'bg-green-500';
      if (ratio >= 70) return 'bg-yellow-500';
      return 'bg-orange-500';
    } else {
      if (ratio <= 10) return 'bg-green-500';
      if (ratio <= 25) return 'bg-yellow-500';
      return 'bg-orange-500';
    }
  };

  return (
    <Card className="max-w-lg mx-auto border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Subscription Details
          </CardTitle>
          {isSubscriptionFriendly && (
            <Badge variant="default" className="bg-green-600">
              <Star className="h-3 w-3 mr-1" />
              Subscription Friendly
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Please review what's included before subscribing to {creatorName}
        </p>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* What's Included */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            What Your Subscription Includes
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Access to subscription-tier posts and content</span>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Direct messaging with {creatorName}</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Priority in comments and interactions</span>
            </li>
          </ul>
        </div>

        {/* Content Ratio Display */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            {creatorName}'s Content Breakdown
          </h4>

          <div className="space-y-3">
            {/* Subscription Content Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Subscription Content</span>
                <span className="font-medium">{contentRatio.subscription}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getRatioColor(contentRatio.subscription, 'subscription')} transition-all`}
                  style={{ width: `${contentRatio.subscription}%` }}
                />
              </div>
            </div>

            {/* Free Content Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Free Content</span>
                <span className="font-medium">{contentRatio.free}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${contentRatio.free}%` }}
                />
              </div>
            </div>

            {/* PPV Content Bar */}
            {contentRatio.ppv > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pay-Per-View Content</span>
                  <span className="font-medium">{contentRatio.ppv}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getRatioColor(contentRatio.ppv, 'ppv')} transition-all`}
                    style={{ width: `${contentRatio.ppv}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Content ratios are calculated from the last 90 days of posts.
          </p>
        </div>

        {/* PPV Warning if applicable */}
        {contentRatio.ppv > 0 && (
          <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              <strong>Additional Purchases May Be Available:</strong>
              <br />
              {creatorName} offers some premium content as pay-per-view ({contentRatio.ppv}% of posts).
              These are optional purchases separate from your subscription.
            </AlertDescription>
          </Alert>
        )}

        {/* Price Summary */}
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-semibold">Subscription Price</span>
            </div>
            <span className="text-xl font-bold text-primary">
              ${subscriptionPrice.toFixed(2)}/month
            </span>
          </div>
        </div>

        {/* Acknowledgment Checkboxes */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
            />
            <label htmlFor="acknowledge" className="text-sm leading-tight cursor-pointer">
              I understand this subscription provides access to subscription-tier content
              and that content availability may vary.
            </label>
          </div>

          {contentRatio.ppv > 0 && (
            <div className="flex items-start gap-3">
              <Checkbox
                id="ppv-understand"
                checked={understoodPPV}
                onCheckedChange={(checked) => setUnderstoodPPV(checked as boolean)}
              />
              <label htmlFor="ppv-understand" className="text-sm leading-tight cursor-pointer">
                I understand that {contentRatio.ppv}% of this creator's content requires
                separate pay-per-view purchases beyond the subscription.
              </label>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onDecline}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={!canProceed}
          onClick={onAccept}
        >
          <Lock className="h-4 w-4 mr-2" />
          Subscribe - ${subscriptionPrice.toFixed(2)}/mo
        </Button>
      </CardFooter>

      <div className="px-6 pb-4">
        <p className="text-xs text-center text-muted-foreground">
          By subscribing, you agree to our{' '}
          <a href="/terms" className="underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/policies/subscription-disclosure" className="underline">
            Subscription Disclosure Policy
          </a>.
        </p>
      </div>
    </Card>
  );
}
