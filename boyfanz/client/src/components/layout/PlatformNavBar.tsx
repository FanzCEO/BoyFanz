import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Grid3X3, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface FanzPlatform {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logoUrl: string;
  primaryColor: string;
  description: string;
  isActive: boolean;
  notificationCount?: number;
}

// All Fanz content platforms in the network
const FANZ_PLATFORMS: FanzPlatform[] = [
  {
    id: 'boyfanz',
    name: 'BoyFanz',
    slug: 'boyfanz',
    domain: 'boy.fanz.website',
    logoUrl: '/platforms/boyfanz-logo.png',
    primaryColor: '#6366f1',
    description: 'Premium male content creators',
    isActive: true,
  },
  {
    id: 'girlfanz',
    name: 'GirlFanz',
    slug: 'girlfanz',
    domain: 'girl.fanz.website',
    logoUrl: '/platforms/girlfanz-logo.png',
    primaryColor: '#ec4899',
    description: 'Premium female content creators',
    isActive: true,
  },
  {
    id: 'gayfanz',
    name: 'GayFanz',
    slug: 'gayfanz',
    domain: 'gay.fanz.website',
    logoUrl: '/platforms/gayfanz-logo.png',
    primaryColor: '#f472b6',
    description: 'LGBTQ+ male creators',
    isActive: true,
  },
  {
    id: 'transfanz',
    name: 'TransFanz',
    slug: 'transfanz',
    domain: 'trans.fanz.website',
    logoUrl: '/platforms/transfanz-logo.png',
    primaryColor: '#14b8a6',
    description: 'Trans & non-binary creators',
    isActive: true,
  },
  {
    id: 'bearfanz',
    name: 'BearFanz',
    slug: 'bearfanz',
    domain: 'bear.fanz.website',
    logoUrl: '/platforms/bearfanz-logo.png',
    primaryColor: '#78716c',
    description: 'Bear community creators',
    isActive: true,
  },
  {
    id: 'daddyfanz',
    name: 'DaddyFanz',
    slug: 'daddyfanz',
    domain: 'daddy.fanz.website',
    logoUrl: '/platforms/daddyfanz-logo.png',
    primaryColor: '#1e40af',
    description: 'Mature male creators',
    isActive: true,
  },
  {
    id: 'pupfanz',
    name: 'PupFanz',
    slug: 'pupfanz',
    domain: 'pup.fanz.website',
    logoUrl: '/platforms/pupfanz-logo.png',
    primaryColor: '#059669',
    description: 'Pet play community',
    isActive: true,
  },
  {
    id: 'milffanz',
    name: 'MILFFanz',
    slug: 'milffanz',
    domain: 'milf.fanz.website',
    logoUrl: '/platforms/milffanz-logo.png',
    primaryColor: '#be185d',
    description: 'Mature female creators',
    isActive: true,
  },
  {
    id: 'cougarfanz',
    name: 'CougarFanz',
    slug: 'cougarfanz',
    domain: 'cougar.fanz.website',
    logoUrl: '/platforms/cougarfanz-logo.png',
    primaryColor: '#b45309',
    description: 'Sophisticated female creators',
    isActive: true,
  },
  {
    id: 'femmefanz',
    name: 'FemmeFanz',
    slug: 'femmefanz',
    domain: 'femme.fanz.website',
    logoUrl: '/platforms/femmefanz-logo.png',
    primaryColor: '#a855f7',
    description: 'Feminine creators showcase',
    isActive: true,
  },
  {
    id: 'taboofanz',
    name: 'TabooFanz',
    slug: 'taboofanz',
    domain: 'taboo.fanz.website',
    logoUrl: '/platforms/taboofanz-logo.png',
    primaryColor: '#7c3aed',
    description: 'Taboo fantasy content',
    isActive: true,
  },
  {
    id: 'fanzuncut',
    name: 'FanzUncut',
    slug: 'fanzuncut',
    domain: 'uncut.fanz.website',
    logoUrl: '/platforms/fanzuncut-logo.png',
    primaryColor: '#dc2626',
    description: 'Unfiltered content',
    isActive: true,
  },
  {
    id: 'brofanz',
    name: 'BroFanz',
    slug: 'brofanz',
    domain: 'bro.fanz.website',
    logoUrl: '/platforms/brofanz-logo.png',
    primaryColor: '#3b82f6',
    description: 'Fraternity style content',
    isActive: true,
  },
  {
    id: 'southernfanz',
    name: 'SouthernFanz',
    slug: 'southernfanz',
    domain: 'southern.fanz.website',
    logoUrl: '/platforms/southernfanz-logo.png',
    primaryColor: '#d97706',
    description: 'Southern charm creators',
    isActive: true,
  },
  {
    id: 'dlbroz',
    name: 'DL Broz',
    slug: 'dlbroz',
    domain: 'dlbroz.fanz.website',
    logoUrl: '/platforms/dlbroz-logo.png',
    primaryColor: '#1f2937',
    description: 'Discreet creators',
    isActive: true,
  },
  {
    id: 'guyz',
    name: 'Guyz',
    slug: 'guyz',
    domain: 'guyz.fanz.website',
    logoUrl: '/platforms/guyz-logo.png',
    primaryColor: '#0ea5e9',
    description: 'Urban male creators',
    isActive: true,
  },
];

// Get current platform from URL
function getCurrentPlatform(): string {
  const hostname = window.location.hostname;
  const platform = FANZ_PLATFORMS.find(p =>
    hostname.includes(p.slug) || hostname.includes(p.domain)
  );
  return platform?.id || 'boyfanz';
}

interface PlatformNavBarProps {
  className?: string;
}

export function PlatformNavBar({ className }: PlatformNavBarProps) {
  const { user } = useAuth();
  const currentPlatformId = getCurrentPlatform();
  const currentPlatform = FANZ_PLATFORMS.find(p => p.id === currentPlatformId) || FANZ_PLATFORMS[0];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch user's platform access
  const { data: platformAccess } = useQuery({
    queryKey: ["/api/user/platform-access"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user/platform-access");
        return res.json();
      } catch {
        // Default: user has access to all platforms
        return { platforms: FANZ_PLATFORMS.map(p => p.id), notificationCounts: {} };
      }
    },
    enabled: !!user,
  });

  // Get user's enabled platforms
  const userPlatforms = FANZ_PLATFORMS.filter(p =>
    platformAccess?.platforms?.includes(p.id) || true // Default to all for now
  );

  // Check scroll position
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  const handlePlatformSwitch = (platform: FanzPlatform) => {
    if (platform.id === currentPlatformId) return;

    // Navigate directly to the target platform
    // Each platform handles its own auth flow through FanzSSO if needed
    window.location.href = `https://${platform.domain}/`;
  };

  // Don't show if user only has access to one platform
  if (userPlatforms.length <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative border-b border-border bg-background/80 backdrop-blur-sm",
        className
      )}
      style={{
        '--platform-color': currentPlatform.primaryColor,
      } as React.CSSProperties}
    >
      {/* Platform color accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: currentPlatform.primaryColor }}
      />

      <div className="flex items-center h-10 px-2 md:px-4">
        {/* All Platforms Icon */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 mr-2 shrink-0"
                onClick={() => window.location.href = '/platforms'}
              >
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>All Platforms</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Left scroll button */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0 hidden md:flex"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Scrollable platform list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
          onScroll={checkScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-center gap-1 px-1">
            {userPlatforms.map((platform) => {
              const isActive = platform.id === currentPlatformId;
              const notificationCount = platformAccess?.notificationCounts?.[platform.id] || 0;

              return (
                <TooltipProvider key={platform.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-8 gap-2 px-3 shrink-0 transition-all",
                          isActive && "ring-2 ring-offset-1",
                          isActive && "shadow-sm"
                        )}
                        style={{
                          ...(isActive && {
                            backgroundColor: `${platform.primaryColor}15`,
                            borderColor: platform.primaryColor,
                            ringColor: platform.primaryColor,
                          })
                        }}
                        onClick={() => handlePlatformSwitch(platform)}
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={platform.logoUrl} alt={platform.name} />
                          <AvatarFallback
                            style={{ backgroundColor: platform.primaryColor }}
                            className="text-white text-[10px]"
                          >
                            {platform.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "text-xs font-medium hidden sm:inline",
                            isActive && "text-foreground"
                          )}
                        >
                          {platform.name.replace('Fanz', '')}
                        </span>
                        {notificationCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="h-4 min-w-4 p-0 flex items-center justify-center text-[10px]"
                          >
                            {notificationCount > 9 ? '9+' : notificationCount}
                          </Badge>
                        )}
                        {!isActive && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 hidden sm:block" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-xs text-muted-foreground">{platform.description}</p>
                      {!isActive && <p className="text-xs text-primary mt-1">Click to switch</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0 hidden md:flex"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Current platform indicator */}
        <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-border shrink-0">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: currentPlatform.primaryColor }}
          />
          <span className="text-xs text-muted-foreground">
            Currently on <span className="font-medium text-foreground">{currentPlatform.name}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default PlatformNavBar;
