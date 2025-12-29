/**
 * Charity Badge Component
 *
 * Displays a user's Wittle Bear Foundation charity supporter badge
 * on their profile. Shows tier, total donated, and causes supported.
 */

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Heart, Home, Dog } from 'lucide-react';

interface CharityBadgeProps {
  tier: 'supporter' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'champion';
  badgeName: string;
  badgeIcon: string;
  totalDonated: string;
  causes?: string[];
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const TIER_STYLES = {
  supporter: {
    bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    border: 'border-purple-400',
    glow: 'shadow-purple-500/25',
  },
  bronze: {
    bg: 'bg-gradient-to-r from-amber-600 to-amber-700',
    border: 'border-amber-500',
    glow: 'shadow-amber-500/25',
  },
  silver: {
    bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
    border: 'border-gray-300',
    glow: 'shadow-gray-400/25',
  },
  gold: {
    bg: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    border: 'border-yellow-400',
    glow: 'shadow-yellow-500/25',
  },
  diamond: {
    bg: 'bg-gradient-to-r from-cyan-300 to-blue-400',
    border: 'border-cyan-200',
    glow: 'shadow-cyan-400/25',
  },
  champion: {
    bg: 'bg-gradient-to-r from-red-500 via-pink-500 to-purple-500',
    border: 'border-pink-400',
    glow: 'shadow-pink-500/50',
  },
};

const SIZE_STYLES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-2',
};

export function CharityBadge({
  tier,
  badgeName,
  badgeIcon,
  totalDonated,
  causes = ['homeless_youth', 'animal_shelters'],
  size = 'md',
  showTooltip = true,
}: CharityBadgeProps) {
  const styles = TIER_STYLES[tier] || TIER_STYLES.supporter;
  const sizeStyle = SIZE_STYLES[size];

  const badgeElement = (
    <Badge
      className={`
        ${styles.bg} ${styles.border} ${styles.glow}
        text-white font-medium border shadow-lg
        hover:scale-105 transition-transform cursor-pointer
        ${sizeStyle}
      `}
    >
      <span className="mr-1">{badgeIcon}</span>
      <span>{badgeName}</span>
      {size !== 'sm' && (
        <span className="ml-1.5 opacity-75">
          ${parseFloat(totalDonated).toFixed(0)}
        </span>
      )}
    </Badge>
  );

  if (!showTooltip) {
    return badgeElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{badgeIcon}</span>
              <div>
                <div className="font-bold">{badgeName}</div>
                <div className="text-sm text-muted-foreground">
                  ${parseFloat(totalDonated).toLocaleString()} donated
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm pt-1 border-t">
              <span className="text-muted-foreground flex items-center gap-1">
                <Heart className="h-3 w-3 text-pink-500" />
                Supporting:
              </span>
              {causes.includes('homeless_youth') && (
                <span className="flex items-center gap-1">
                  <Home className="h-3 w-3 text-blue-500" />
                  Youth
                </span>
              )}
              {causes.includes('animal_shelters') && (
                <span className="flex items-center gap-1">
                  <Dog className="h-3 w-3 text-amber-500" />
                  Animals
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              This user supports the Wittle Bear Foundation
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Displays multiple charity badges in a row
 */
interface CharityBadgesRowProps {
  badges: Array<{
    tier: 'supporter' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'champion';
    badgeName: string;
    badgeIcon: string;
    totalDonated: string;
    causes?: string[];
  }>;
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
}

export function CharityBadgesRow({
  badges,
  size = 'sm',
  maxDisplay = 3,
}: CharityBadgesRowProps) {
  if (!badges || badges.length === 0) return null;

  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {displayBadges.map((badge, index) => (
        <CharityBadge
          key={index}
          tier={badge.tier}
          badgeName={badge.badgeName}
          badgeIcon={badge.badgeIcon}
          totalDonated={badge.totalDonated}
          causes={badge.causes}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className={SIZE_STYLES[size]}>
          +{remaining} more
        </Badge>
      )}
    </div>
  );
}

export default CharityBadge;
