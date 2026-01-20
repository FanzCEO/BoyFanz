import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Lock, ExternalLink, Crown, Sparkles, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface FanzPlatform {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logoUrl: string;
  primaryColor: string;
  description: string;
  category: 'general' | 'niche' | 'premium' | 'restricted' | 'coming_soon';
  isActive: boolean;
  requiresMembership: boolean;
  membershipTier?: string;
  userHasAccess: boolean;
  comingSoon?: boolean;
}

// All Fanz content platforms in the network (all unlocked)
const FANZ_PLATFORMS: Omit<FanzPlatform, 'userHasAccess'>[] = [
  {
    id: 'boyfanz',
    name: 'BoyFanz',
    slug: 'boyfanz',
    domain: 'boyfanz.fanz.website',
    logoUrl: '/platforms/boyfanz-logo.png',
    primaryColor: '#6366f1',
    description: 'Premium male content creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'girlfanz',
    name: 'GirlFanz',
    slug: 'girlfanz',
    domain: 'girlfanz.fanz.website',
    logoUrl: '/platforms/girlfanz-logo.png',
    primaryColor: '#ec4899',
    description: 'Premium female content creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'transfanz',
    name: 'TransFanz',
    slug: 'transfanz',
    domain: 'transfanz.fanz.website',
    logoUrl: '/platforms/transfanz-logo.png',
    primaryColor: '#14b8a6',
    description: 'Trans & non-binary creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'southernfanz',
    name: 'SouthernFanz',
    slug: 'southernfanz',
    domain: 'southernfanz.fanz.website',
    logoUrl: '/platforms/southernfanz-logo.png',
    primaryColor: '#d97706',
    description: 'Southern charm creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'latinofanz',
    name: 'LatinoFanz',
    slug: 'latinofanz',
    domain: 'latinofanz.fanz.website',
    logoUrl: '/platforms/latinofanz-logo.png',
    primaryColor: '#dc2626',
    description: 'Latino/Latina creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'asiafanz',
    name: 'AsiaFanz',
    slug: 'asiafanz',
    domain: 'asiafanz.fanz.website',
    logoUrl: '/platforms/asiafanz-logo.png',
    primaryColor: '#e11d48',
    description: 'Asian content creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'femmefanz',
    name: 'FemmeFanz',
    slug: 'femmefanz',
    domain: 'femmefanz.fanz.website',
    logoUrl: '/platforms/femmefanz-logo.png',
    primaryColor: '#a855f7',
    description: 'Feminine creators showcase',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'bearfanz',
    name: 'BearFanz',
    slug: 'bearfanz',
    domain: 'bearfanz.fanz.website',
    logoUrl: '/platforms/bearfanz-logo.png',
    primaryColor: '#78716c',
    description: 'Bear community creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'fitfanz',
    name: 'FitFanz',
    slug: 'fitfanz',
    domain: 'fitfanz.fanz.website',
    logoUrl: '/platforms/fitfanz-logo.png',
    primaryColor: '#22c55e',
    description: 'Fitness & wellness creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'inkfanz',
    name: 'InkFanz',
    slug: 'inkfanz',
    domain: 'inkfanz.fanz.website',
    logoUrl: '/platforms/inkfanz-logo.png',
    primaryColor: '#1f2937',
    description: 'Tattoo & alt scene creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'cosplayfanz',
    name: 'CosplayFanz',
    slug: 'cosplayfanz',
    domain: 'cosplayfanz.fanz.website',
    logoUrl: '/platforms/cosplayfanz-logo.png',
    primaryColor: '#f59e0b',
    description: 'Cosplay & character creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'kinkfanz',
    name: 'KinkFanz',
    slug: 'kinkfanz',
    domain: 'kinkfanz.fanz.website',
    logoUrl: '/platforms/kinkfanz-logo.png',
    primaryColor: '#7c3aed',
    description: 'BDSM & kink community',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'couplesfanz',
    name: 'CouplesFanz',
    slug: 'couplesfanz',
    domain: 'couplesfanz.fanz.website',
    logoUrl: '/platforms/couplesfanz-logo.png',
    primaryColor: '#f43f5e',
    description: 'Couples content creators',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
  {
    id: 'pupfanz',
    name: 'PupFanz',
    slug: 'pupfanz',
    domain: 'pupfanz.fanz.website',
    logoUrl: '/platforms/pupfanz-logo.png',
    primaryColor: '#059669',
    description: 'Pet play community',
    category: 'niche',
    isActive: true,
    requiresMembership: false,
  },
];

// Coming Soon Fanz Products (locked/not yet available)
const FANZ_COMING_SOON: Omit<FanzPlatform, 'userHasAccess'>[] = [
  {
    id: 'fanztube',
    name: 'FanzTube',
    slug: 'fanztube',
    domain: 'fanztube.com',
    logoUrl: '/platforms/fanztube-logo.png',
    primaryColor: '#00e5ff',
    description: 'Video streaming platform',
    category: 'coming_soon',
    isActive: false,
    requiresMembership: true,
    comingSoon: true,
  },
  {
    id: 'fanzai',
    name: 'FanzAI',
    slug: 'fanzai',
    domain: 'fanzai.com',
    logoUrl: '/platforms/fanzai-logo.png',
    primaryColor: '#00d4ff',
    description: 'AI-powered content tools',
    category: 'coming_soon',
    isActive: false,
    requiresMembership: true,
    comingSoon: true,
  },
  {
    id: 'fanzmobile',
    name: 'FanzMobile',
    slug: 'fanzmobile',
    domain: 'fanz.app',
    logoUrl: '/platforms/fanzmobile-logo.png',
    primaryColor: '#34d399',
    description: 'Native mobile app',
    category: 'coming_soon',
    isActive: false,
    requiresMembership: true,
    comingSoon: true,
  },
  {
    id: 'fanzpay',
    name: 'FanzPay',
    slug: 'fanzpay',
    domain: 'fanzpay.com',
    logoUrl: '/platforms/fanzpay-logo.png',
    primaryColor: '#fbbf24',
    description: 'Creator payment solutions',
    category: 'coming_soon',
    isActive: false,
    requiresMembership: true,
    comingSoon: true,
  },
  {
    id: 'fanzdash',
    name: 'FanzDash',
    slug: 'fanzdash',
    domain: 'fanzdash.com',
    logoUrl: '/platforms/fanzdash-logo.png',
    primaryColor: '#8b5cf6',
    description: 'Central command center',
    category: 'coming_soon',
    isActive: false,
    requiresMembership: true,
    comingSoon: true,
  },
];

// Get current platform from URL
function getCurrentPlatform(): string {
  const hostname = window.location.hostname;
  const platform = FANZ_PLATFORMS.find(p => hostname.includes(p.slug));
  return platform?.id || 'boyfanz';
}

export function PlatformSwitcher() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const currentPlatformId = getCurrentPlatform();
  const currentPlatform = FANZ_PLATFORMS.find(p => p.id === currentPlatformId) || FANZ_PLATFORMS[0];

  // Fetch user's platform access from API
  const { data: platformAccess } = useQuery({
    queryKey: ["/api/user/platform-access"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user/platform-access");
        return res.json();
      } catch {
        return { platforms: [] };
      }
    },
    enabled: !!user,
  });

  const handlePlatformSwitch = (platform: typeof FANZ_PLATFORMS[0]) => {
    // Check if user has access
    if (platform.requiresMembership && !platformAccess?.platforms?.includes(platform.id)) {
      // Show upgrade prompt or redirect to membership page
      window.location.href = `/upgrade?platform=${platform.slug}`;
      return;
    }

    // Use Fanz SSO - redirect with session token
    const ssoUrl = `https://${platform.domain}/auth/sso?token=${encodeURIComponent(
      document.cookie.split('session=')[1]?.split(';')[0] || ''
    )}&redirect=/dashboard`;

    window.location.href = ssoUrl;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 h-auto"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentPlatform.logoUrl} alt={currentPlatform.name} />
            <AvatarFallback
              style={{ backgroundColor: currentPlatform.primaryColor }}
              className="text-white text-xs"
            >
              {currentPlatform.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium hidden sm:inline">{currentPlatform.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[80vh] overflow-y-auto" align="start">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Fanz Network
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* All Content Platforms (Unlocked) */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Content Platforms
          </DropdownMenuLabel>
          {FANZ_PLATFORMS.filter(p => p.isActive).map((platform) => (
            <DropdownMenuItem
              key={platform.id}
              className={`cursor-pointer ${platform.id === currentPlatformId ? 'bg-accent' : ''}`}
              onClick={() => handlePlatformSwitch(platform)}
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={platform.logoUrl} alt={platform.name} />
                  <AvatarFallback
                    style={{ backgroundColor: platform.primaryColor }}
                    className="text-white text-xs"
                  >
                    {platform.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{platform.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{platform.description}</p>
                </div>
                {platform.id === currentPlatformId ? (
                  <Badge variant="secondary" className="text-xs">Current</Badge>
                ) : (
                  <ExternalLink className="h-3 w-3 opacity-50" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Coming Soon Products (Locked) */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Coming Soon
          </DropdownMenuLabel>
          {FANZ_COMING_SOON.map((platform) => (
            <DropdownMenuItem
              key={platform.id}
              className="cursor-not-allowed opacity-60"
              disabled
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-8 w-8 grayscale">
                  <AvatarImage src={platform.logoUrl} alt={platform.name} />
                  <AvatarFallback
                    style={{ backgroundColor: platform.primaryColor }}
                    className="text-white text-xs opacity-50"
                  >
                    {platform.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{platform.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{platform.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Soon
                </Badge>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => window.location.href = '/upgrade'}
        >
          <Crown className="h-4 w-4 mr-2 text-yellow-500" />
          <span>Upgrade Membership</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default PlatformSwitcher;
