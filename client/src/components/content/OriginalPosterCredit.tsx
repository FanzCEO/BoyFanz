import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ExternalLink, Share2, CheckCircle2 } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  domain: string;
  color: string;
}

const PLATFORMS: Record<string, Platform> = {
  boyfanz: { id: 'boyfanz', name: 'BoyFanz', domain: 'boy.fanz.website', color: '#6366f1' },
  girlfanz: { id: 'girlfanz', name: 'GirlFanz', domain: 'girl.fanz.website', color: '#ec4899' },
  gayfanz: { id: 'gayfanz', name: 'GayFanz', domain: 'gay.fanz.website', color: '#f472b6' },
  transfanz: { id: 'transfanz', name: 'TransFanz', domain: 'trans.fanz.website', color: '#14b8a6' },
  bearfanz: { id: 'bearfanz', name: 'BearFanz', domain: 'bear.fanz.website', color: '#78716c' },
  daddyfanz: { id: 'daddyfanz', name: 'DaddyFanz', domain: 'daddy.fanz.website', color: '#1e40af' },
  pupfanz: { id: 'pupfanz', name: 'PupFanz', domain: 'pup.fanz.website', color: '#059669' },
  milffanz: { id: 'milffanz', name: 'MILFFanz', domain: 'milf.fanz.website', color: '#be185d' },
  cougarfanz: { id: 'cougarfanz', name: 'CougarFanz', domain: 'cougar.fanz.website', color: '#b45309' },
  femmefanz: { id: 'femmefanz', name: 'FemmeFanz', domain: 'femme.fanz.website', color: '#a855f7' },
  taboofanz: { id: 'taboofanz', name: 'TabooFanz', domain: 'taboo.fanz.website', color: '#7c3aed' },
  fanzuncut: { id: 'fanzuncut', name: 'FanzUncut', domain: 'uncut.fanz.website', color: '#dc2626' },
  brofanz: { id: 'brofanz', name: 'BroFanz', domain: 'bro.fanz.website', color: '#3b82f6' },
  southernfanz: { id: 'southernfanz', name: 'SouthernFanz', domain: 'southern.fanz.website', color: '#d97706' },
  dlbroz: { id: 'dlbroz', name: 'DL Broz', domain: 'dlbroz.fanz.website', color: '#1f2937' },
  guyz: { id: 'guyz', name: 'Guyz', domain: 'guyz.fanz.website', color: '#0ea5e9' },
};

interface OriginalCreator {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

interface OriginalPosterCreditProps {
  originalCreator: OriginalCreator;
  sourcePlatformId: string;
  preferredPlatformLink?: string | null;
  showCredit?: boolean;
  linkToProfile?: boolean;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export function OriginalPosterCredit({
  originalCreator,
  sourcePlatformId,
  preferredPlatformLink,
  showCredit = true,
  linkToProfile = true,
  variant = 'default',
  className,
}: OriginalPosterCreditProps) {
  if (!showCredit) return null;

  const sourcePlatform = PLATFORMS[sourcePlatformId];
  const linkPlatform = preferredPlatformLink
    ? PLATFORMS[preferredPlatformLink]
    : sourcePlatform;

  const profileUrl = linkToProfile && linkPlatform
    ? `https://${linkPlatform.domain}/creator/${originalCreator.id}`
    : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (profileUrl) {
      e.stopPropagation();
      window.open(profileUrl, '_blank');
    }
  };

  if (variant === 'inline') {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-sm text-muted-foreground",
          linkToProfile && "cursor-pointer hover:text-foreground",
          className
        )}
        onClick={handleClick}
      >
        <Share2 className="h-3 w-3" />
        Originally by{' '}
        <span className="font-medium text-foreground">
          @{originalCreator.username}
        </span>
        {originalCreator.isVerified && (
          <CheckCircle2 className="h-3 w-3 text-blue-500" />
        )}
        on{' '}
        <span style={{ color: sourcePlatform?.color }}>
          {sourcePlatform?.name || sourcePlatformId}
        </span>
        {linkToProfile && <ExternalLink className="h-3 w-3" />}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-full bg-muted/50",
                linkToProfile && "cursor-pointer hover:bg-muted",
                className
              )}
              onClick={handleClick}
            >
              <Share2 className="h-3 w-3 text-muted-foreground" />
              <Avatar className="h-5 w-5">
                <AvatarImage src={originalCreator.avatarUrl} />
                <AvatarFallback className="text-[10px]">
                  {originalCreator.displayName?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                @{originalCreator.username}
              </span>
              {originalCreator.isVerified && (
                <CheckCircle2 className="h-3 w-3 text-blue-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Originally posted on {sourcePlatform?.name || sourcePlatformId}</p>
            {linkToProfile && <p className="text-xs text-muted-foreground">Click to view profile</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30",
        linkToProfile && "cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={handleClick}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={originalCreator.avatarUrl} />
          <AvatarFallback>
            {originalCreator.displayName?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        {sourcePlatform && (
          <div
            className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center border-2 border-background"
            style={{ backgroundColor: sourcePlatform.color }}
          >
            <span className="text-[8px] text-white font-bold">
              {sourcePlatform.name.substring(0, 1).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Share2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">Originally posted by</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">@{originalCreator.username}</span>
          {originalCreator.isVerified && (
            <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
          )}
          <span className="text-sm text-muted-foreground">on</span>
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              borderColor: sourcePlatform?.color,
              color: sourcePlatform?.color,
            }}
          >
            {sourcePlatform?.name || sourcePlatformId}
          </Badge>
        </div>
      </div>

      {linkToProfile && (
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
    </div>
  );
}

export default OriginalPosterCredit;
