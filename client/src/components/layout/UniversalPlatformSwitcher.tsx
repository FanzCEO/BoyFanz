/**
 * Universal Platform Switcher Component
 *
 * A comprehensive dropdown menu for switching between all FANZ ecosystem platforms.
 * Features:
 * - Platform-specific theming
 * - Categorized sections (Fan Platforms, Infrastructure, AI, Support)
 * - Greyed-out pending platforms
 * - RecoveryFanz.com quick link
 * - SSO-enabled seamless switching
 */

import { useState, useMemo } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  Lock,
  ExternalLink,
  Sparkles,
  Clock,
  Bot,
  Settings,
  LifeBuoy,
  Globe,
  Cpu,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Types
interface FanzPlatform {
  id: string;
  name: string;
  slug: string;
  domain: string;
  port: number;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  description: string;
  tagline?: string;
  category: 'fan_platform' | 'infrastructure' | 'auxiliary' | 'ai_bot' | 'support';
  status: 'active' | 'pending_audit' | 'coming_soon' | 'maintenance';
  isUserFacing: boolean;
  requiresAuth: boolean;
  ssoEnabled: boolean;
  platformId: string;
  dbName: string;
}

interface PlatformSwitcherProps {
  currentPlatformId?: string; // Optional - will auto-detect from URL if not provided
  platformTheme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  className?: string;
  compact?: boolean;
}

// ============================================
// EMBEDDED REGISTRY (Copy from shared/fanzEcosystemRegistry.ts)
// ============================================
const FAN_PLATFORMS: FanzPlatform[] = [
  {
    id: 'boyfanz', name: 'BoyFanz', slug: 'boyfanz', domain: 'boy.fanz.website', port: 3003,
    logoUrl: '/platforms/boyfanz-logo.png', primaryColor: '#00e5ff', secondaryColor: '#d4af37',
    accentColor: '#ffffff', backgroundColor: '#0a0a0a', description: 'Premium male content creators',
    tagline: "Every Man's Playground", category: 'fan_platform', status: 'active',
    isUserFacing: true, requiresAuth: false, ssoEnabled: true, platformId: 'boyfanz', dbName: 'boyfanz_db',
  },
  {
    id: 'girlfanz', name: 'GirlFanz', slug: 'girlfanz', domain: 'girl.fanz.website', port: 3001,
    logoUrl: '/platforms/girlfanz-logo.png', primaryColor: '#ff69b4', secondaryColor: '#9c4eb4',
    accentColor: '#5bcefa', backgroundColor: '#0a0a0a', description: 'Premium female content creators',
    tagline: 'Empowered Expression', category: 'fan_platform', status: 'pending_audit',
    isUserFacing: true, requiresAuth: false, ssoEnabled: true, platformId: 'girlfanz', dbName: 'girlfanz_db',
  },
  {
    id: 'gayfanz', name: 'GayFanz', slug: 'gayfanz', domain: 'gay.fanz.website', port: 3014,
    logoUrl: '/platforms/gayfanz-logo.png', primaryColor: '#00e5ff', secondaryColor: '#d4af37',
    accentColor: '#d4af37', backgroundColor: '#000000', description: 'LGBTQ+ male creators',
    category: 'fan_platform', status: 'active', isUserFacing: true, requiresAuth: false,
    ssoEnabled: true, platformId: 'gayfanz', dbName: 'gayfanz_db',
  },
  {
    id: 'transfanz', name: 'TransFanz', slug: 'transfanz', domain: 'trans.fanz.website', port: 3007,
    logoUrl: '/platforms/transfanz-logo.png', primaryColor: '#F5A9B8', secondaryColor: '#5BCEFA',
    accentColor: '#9c4eb4', backgroundColor: '#0a0a14', description: 'Trans & non-binary creators',
    tagline: 'Embrace Your True Self', category: 'fan_platform', status: 'active',
    isUserFacing: true, requiresAuth: false, ssoEnabled: true, platformId: 'transfanz', dbName: 'transfanz_db',
  },
  {
    id: 'milffanz', name: 'MilfFanz', slug: 'milffanz', domain: 'milf.fanz.website', port: 3017,
    logoUrl: '/platforms/milffanz-logo.png', primaryColor: '#00e5ff', secondaryColor: '#d4af37',
    accentColor: '#d4af37', backgroundColor: '#000000', description: 'Mature women creators',
    category: 'fan_platform', status: 'active', isUserFacing: true, requiresAuth: false,
    ssoEnabled: true, platformId: 'milffanz', dbName: 'milffanz_db',
  },
  {
    id: 'cougarfanz', name: 'CougarFanz', slug: 'cougarfanz', domain: 'cougar.fanz.website', port: 3003,
    logoUrl: '/platforms/cougarfanz-logo.png', primaryColor: '#D4AF37', secondaryColor: '#722F37',
    accentColor: '#B8860B', backgroundColor: '#1a1a1a', description: 'Sophisticated mature creators',
    tagline: 'Where Experience is Worshipped', category: 'fan_platform', status: 'pending_audit',
    isUserFacing: true, requiresAuth: false, ssoEnabled: true, platformId: 'cougarfanz', dbName: 'cougarfanz_db',
  },
  {
    id: 'bearfanz', name: 'BearFanz', slug: 'bearfanz', domain: 'bear.fanz.website', port: 3005,
    logoUrl: '/platforms/bearfanz-logo.png', primaryColor: '#00e5ff', secondaryColor: '#d4af37',
    accentColor: '#d4af37', backgroundColor: '#050505', description: 'Bear community creators',
    category: 'fan_platform', status: 'active', isUserFacing: true, requiresAuth: false,
    ssoEnabled: true, platformId: 'bearfanz', dbName: 'bearfanz_db',
  },
  {
    id: 'daddyfanz', name: 'DaddyFanz', slug: 'daddyfanz', domain: 'daddy.fanz.website', port: 3011,
    logoUrl: '/platforms/daddyfanz-logo.png', primaryColor: '#00CFFF', secondaryColor: '#F5C237',
    accentColor: '#7B8794', backgroundColor: '#0a0a0a', description: 'Mature masculine creators',
    category: 'fan_platform', status: 'pending_audit', isUserFacing: true, requiresAuth: false,
    ssoEnabled: true, platformId: 'daddyfanz', dbName: 'daddyfanz_db',
  },
  {
    id: 'pupfanz', name: 'PupFanz', slug: 'pupfanz', domain: 'pup.fanz.website', port: 3006,
    logoUrl: '/platforms/pupfanz-logo.png', primaryColor: '#ff8c00', secondaryColor: '#4169e1',
    accentColor: '#ffffff', backgroundColor: '#fff8f0', description: 'Pup play community',
    category: 'fan_platform', status: 'pending_audit', isUserFacing: true, requiresAuth: false,
    ssoEnabled: true, platformId: 'pupfanz', dbName: 'pupfanz_db',
  },
  {
    id: 'taboofanz', name: 'TabooFanz', slug: 'taboofanz', domain: 'taboo.fanz.website', port: 3019,
    logoUrl: '/platforms/taboofanz-logo.png', primaryColor: '#ff00ff', secondaryColor: '#00ffff',
    accentColor: '#00ffff', backgroundColor: '#0a0a0f', description: 'Edge content creators',
    tagline: 'Beyond Boundaries', category: 'fan_platform', status: 'active',
    isUserFacing: true, requiresAuth: false, ssoEnabled: true, platformId: 'taboofanz', dbName: 'taboofanz_db',
  },
  {
    id: 'fanzuncut', name: 'FanzUncut', slug: 'fanzuncut', domain: 'uncut.fanz.website', port: 3020,
    logoUrl: '/platforms/fanzuncut-logo.png', primaryColor: '#00e5ff', secondaryColor: '#d4af37',
    accentColor: '#d4af37', backgroundColor: '#050505', description: 'Uncensored content',
    category: 'fan_platform', status: 'active', isUserFacing: true, requiresAuth: false,
    ssoEnabled: true, platformId: 'fanzuncut', dbName: 'fanzuncut_db',
  },
  {
    id: 'femmefanz', name: 'FemmeFanz', slug: 'femmefanz', domain: 'femme.fanz.website', port: 3013,
    logoUrl: '/platforms/femmefanz-logo.png', primaryColor: '#00e5ff', secondaryColor: '#d4af37',
    accentColor: '#d4af37', backgroundColor: '#000000', description: 'Feminine creators showcase',
    category: 'fan_platform', status: 'active', isUserFacing: true, requiresAuth: false,
    ssoEnabled: true, platformId: 'femmefanz', dbName: 'femmefanz_db',
  },
  {
    id: 'brofanz', name: 'BroFanz', slug: 'brofanz', domain: 'bro.fanz.website', port: 3022,
    logoUrl: '/platforms/brofanz-logo.png', primaryColor: '#1E90FF', secondaryColor: '#7FFF00',
    accentColor: '#00FFFF', backgroundColor: '#0a0a0f', description: 'Athletic creators',
    tagline: 'The Brotherhood Network', category: 'fan_platform', status: 'active',
    isUserFacing: true, requiresAuth: false, ssoEnabled: true, platformId: 'brofanz', dbName: 'brofanz_db',
  },
  {
    id: 'southernfanz', name: 'SouthernFanz', slug: 'southernfanz', domain: 'southern.fanz.website', port: 3215,
    logoUrl: '/platforms/southernfanz-logo.png', primaryColor: '#D4A000', secondaryColor: '#8B4513',
    accentColor: '#D4A000', backgroundColor: '#0f0a06', description: 'Country & southern creators',
    tagline: 'Country. Unfiltered.', category: 'fan_platform', status: 'pending_audit',
    isUserFacing: true, requiresAuth: false, ssoEnabled: true, platformId: 'southernfanz', dbName: 'southernfanz_db',
  },
  {
    id: 'dlbroz', name: 'DLBroz', slug: 'dlbroz', domain: 'dlbroz.fanz.website', port: 3015,
    logoUrl: '/platforms/dlbroz-logo.png', primaryColor: '#334155', secondaryColor: '#d4af37',
    accentColor: '#d4af37', backgroundColor: '#000000', description: 'Discreet masculine space',
    tagline: 'On The Down Low', category: 'fan_platform', status: 'active',
    isUserFacing: true, requiresAuth: false, ssoEnabled: true, platformId: 'dlbroz', dbName: 'dlbroz_db',
  },
  {
    id: 'guyz', name: 'Guyz', slug: 'guyz', domain: 'guyz.fanz.website', port: 3016,
    logoUrl: '/platforms/guyz-logo.png', primaryColor: '#00e5ff', secondaryColor: '#d4af37',
    accentColor: '#d4af37', backgroundColor: '#000000', description: 'General male creators',
    category: 'fan_platform', status: 'active', isUserFacing: true, requiresAuth: false,
    ssoEnabled: true, platformId: 'guyz', dbName: 'guyz_db',
  },
];

const INFRASTRUCTURE_SERVICES: FanzPlatform[] = [
  {
    id: 'fanzdash', name: 'FanzDash', slug: 'fanzdash', domain: 'dash.fanz.website', port: 3000,
    logoUrl: '/platforms/fanzdash-logo.png', primaryColor: '#8b5cf6', secondaryColor: '#6366f1',
    accentColor: '#a855f7', backgroundColor: '#0f0f23', description: 'Central Command Center',
    category: 'infrastructure', status: 'active', isUserFacing: true, requiresAuth: true,
    ssoEnabled: true, platformId: 'fanzdash', dbName: 'fanz_core',
  },
  {
    id: 'fanzsso', name: 'FanzSSO', slug: 'fanzsso', domain: 'sso.fanz.website', port: 3100,
    logoUrl: '/platforms/fanzsso-logo.png', primaryColor: '#10b981', secondaryColor: '#059669',
    accentColor: '#34d399', backgroundColor: '#0f172a', description: 'Single Sign-On Portal',
    category: 'infrastructure', status: 'active', isUserFacing: true, requiresAuth: false,
    ssoEnabled: false, platformId: 'fanzsso', dbName: 'fanz_core',
  },
];

const AUXILIARY_SERVICES: FanzPlatform[] = [
  {
    id: 'fanzknowledgebase', name: 'Knowledge Base', slug: 'kb', domain: 'kb.fanz.website', port: 3060,
    logoUrl: '/platforms/kb-logo.png', primaryColor: '#3b82f6', secondaryColor: '#2563eb',
    accentColor: '#60a5fa', backgroundColor: '#0f172a', description: 'Help & Documentation',
    category: 'auxiliary', status: 'active', isUserFacing: true, requiresAuth: false,
    ssoEnabled: true, platformId: 'knowledge-base', dbName: 'fanz_core',
  },
  {
    id: 'fanzhub', name: 'FanzHub', slug: 'fanzhub', domain: 'hub.fanz.website', port: 3080,
    logoUrl: '/platforms/hub-logo.png', primaryColor: '#f97316', secondaryColor: '#ea580c',
    accentColor: '#fb923c', backgroundColor: '#1c1917', description: 'Creator Hub & Community',
    category: 'auxiliary', status: 'active', isUserFacing: true, requiresAuth: true,
    ssoEnabled: true, platformId: 'hubfanz', dbName: 'fanz_core',
  },
  {
    id: 'fanzincognito', name: 'FanzIncognito', slug: 'incognito', domain: 'incognito.fanz.website', port: 3058,
    logoUrl: '/platforms/incognito-logo.png', primaryColor: '#1e1b4b', secondaryColor: '#312e81',
    accentColor: '#4f46e5', backgroundColor: '#020617', description: 'Private Browsing Mode',
    category: 'auxiliary', status: 'active', isUserFacing: true, requiresAuth: false,
    ssoEnabled: false, platformId: 'fanz-incognito', dbName: 'fanz_core',
  },
];

const AI_SERVICES: FanzPlatform[] = [
  {
    id: 'fanzgpt', name: 'FanzGPT', slug: 'gpt', domain: 'gpt.fanz.website', port: 3110,
    logoUrl: '/platforms/gpt-logo.png', primaryColor: '#00d4ff', secondaryColor: '#0891b2',
    accentColor: '#22d3ee', backgroundColor: '#0f172a', description: 'AI Chat Assistant',
    tagline: 'Your AI Companion', category: 'ai_bot', status: 'pending_audit',
    isUserFacing: true, requiresAuth: true, ssoEnabled: true, platformId: 'gpt-fanz', dbName: 'fanz_core',
  },
  {
    id: 'fanzai', name: 'FanzAI Studio', slug: 'ai', domain: 'ai.fanz.website', port: 3105,
    logoUrl: '/platforms/ai-logo.png', primaryColor: '#a855f7', secondaryColor: '#9333ea',
    accentColor: '#c084fc', backgroundColor: '#0a0a0a', description: 'AI Content Tools',
    category: 'ai_bot', status: 'active', isUserFacing: true, requiresAuth: true,
    ssoEnabled: true, platformId: 'ai-fanz', dbName: 'fanz_core',
  },
  {
    id: 'fanzbot', name: 'FanzBot', slug: 'bot', domain: 'bot.fanz.website', port: 3081,
    logoUrl: '/platforms/bot-logo.png', primaryColor: '#06b6d4', secondaryColor: '#0891b2',
    accentColor: '#22d3ee', backgroundColor: '#18181b', description: 'Automated Assistant',
    category: 'ai_bot', status: 'active', isUserFacing: true, requiresAuth: true,
    ssoEnabled: true, platformId: 'fanz-bot', dbName: 'fanz_core',
  },
];

const SUPPORT_SERVICES: FanzPlatform[] = [
  {
    id: 'recoveryfanz', name: 'RecoveryFanz', slug: 'recovery', domain: 'recoveryfanz.com', port: 0,
    logoUrl: '/platforms/recovery-logo.png', primaryColor: '#10b981', secondaryColor: '#059669',
    accentColor: '#34d399', backgroundColor: '#0f172a', description: 'Account Recovery & Support',
    tagline: 'Get Back On Track', category: 'support', status: 'active',
    isUserFacing: true, requiresAuth: false, ssoEnabled: false, platformId: 'recoveryfanz', dbName: 'fanz_core',
  },
];

// Helper to get all user-facing platforms
const getAllUserFacingPlatforms = () => [
  ...FAN_PLATFORMS.filter(p => p.isUserFacing),
  ...INFRASTRUCTURE_SERVICES.filter(p => p.isUserFacing),
  ...AUXILIARY_SERVICES.filter(p => p.isUserFacing),
  ...AI_SERVICES.filter(p => p.isUserFacing),
  ...SUPPORT_SERVICES.filter(p => p.isUserFacing),
];

// Get current platform from URL
function detectCurrentPlatform(): string {
  if (typeof window === 'undefined') return 'boyfanz';
  const hostname = window.location.hostname;
  const allPlatforms = getAllUserFacingPlatforms();
  const platform = allPlatforms.find(p =>
    hostname.includes(p.slug) || hostname.includes(p.domain)
  );
  return platform?.id || 'boyfanz';
}

// Category icons
const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'fan_platform': return <Users className="h-3 w-3" />;
    case 'infrastructure': return <Settings className="h-3 w-3" />;
    case 'auxiliary': return <Globe className="h-3 w-3" />;
    case 'ai_bot': return <Bot className="h-3 w-3" />;
    case 'support': return <LifeBuoy className="h-3 w-3" />;
    default: return <Cpu className="h-3 w-3" />;
  }
};

// Status indicator
const StatusIndicator = ({ status }: { status: string }) => {
  if (status === 'active') {
    return <CheckCircle className="h-3 w-3 text-green-500" />;
  } else if (status === 'pending_audit') {
    return <AlertCircle className="h-3 w-3 text-yellow-500" />;
  } else if (status === 'coming_soon') {
    return <Clock className="h-3 w-3 text-blue-500" />;
  }
  return <Lock className="h-3 w-3 text-gray-500" />;
};

// Platform item renderer
const PlatformItem = ({
  platform,
  isCurrent,
  onSelect,
  themeColor,
}: {
  platform: FanzPlatform;
  isCurrent: boolean;
  onSelect: (platform: FanzPlatform) => void;
  themeColor: string;
}) => {
  const isDisabled = platform.status === 'pending_audit' || platform.status === 'coming_soon';

  return (
    <DropdownMenuItem
      className={`
        cursor-pointer transition-all duration-200
        ${isCurrent ? 'bg-accent/50 border-l-2' : 'hover:bg-accent/30'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
      `}
      style={isCurrent ? { borderLeftColor: themeColor } : undefined}
      onClick={() => !isDisabled && onSelect(platform)}
      disabled={isDisabled}
    >
      <div className="flex items-center gap-3 w-full py-1">
        <Avatar className={`h-8 w-8 ${isDisabled ? 'grayscale' : ''}`}>
          <AvatarImage src={platform.logoUrl} alt={platform.name} />
          <AvatarFallback
            style={{ backgroundColor: isDisabled ? '#6b7280' : platform.primaryColor }}
            className="text-white text-xs font-bold"
          >
            {platform.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-medium text-sm ${isDisabled ? 'text-muted-foreground' : ''}`}>
              {platform.name}
            </p>
            <StatusIndicator status={platform.status} />
          </div>
          <p className="text-xs text-muted-foreground truncate">{platform.description}</p>
        </div>
        {isCurrent ? (
          <Badge
            variant="secondary"
            className="text-xs shrink-0"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
          >
            Current
          </Badge>
        ) : isDisabled ? (
          <Badge variant="outline" className="text-xs shrink-0">
            <Lock className="h-2.5 w-2.5 mr-1" />
            {platform.status === 'pending_audit' ? 'Pending' : 'Soon'}
          </Badge>
        ) : (
          <ExternalLink className="h-3 w-3 opacity-40 shrink-0" />
        )}
      </div>
    </DropdownMenuItem>
  );
};

// Main component
export function UniversalPlatformSwitcher({
  currentPlatformId,
  platformTheme,
  className = '',
  compact = false,
}: PlatformSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-detect platform if not explicitly provided
  const detectedPlatformId = useMemo(() => {
    if (currentPlatformId) return currentPlatformId;
    return detectCurrentPlatform();
  }, [currentPlatformId]);

  const currentPlatform = useMemo(() => {
    const all = getAllUserFacingPlatforms();
    return all.find(p => p.id === detectedPlatformId) || all[0];
  }, [detectedPlatformId]);

  const themeColor = platformTheme?.primaryColor || currentPlatform.primaryColor;

  const handlePlatformSwitch = (platform: FanzPlatform) => {
    if (platform.id === detectedPlatformId) return;

    // Build SSO URL for seamless switch
    const targetUrl = platform.ssoEnabled
      ? `https://${platform.domain}/auth/sso?redirect=/`
      : `https://${platform.domain}`;

    window.location.href = targetUrl;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-accent/50 ${className}`}
          style={{
            '--hover-color': `${themeColor}20`,
          } as React.CSSProperties}
        >
          <Avatar className="h-6 w-6 ring-2 ring-offset-1 ring-offset-background" style={{ ringColor: themeColor }}>
            <AvatarImage src={currentPlatform.logoUrl} alt={currentPlatform.name} />
            <AvatarFallback
              style={{ backgroundColor: themeColor }}
              className="text-white text-xs font-bold"
            >
              {currentPlatform.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <span className="font-semibold hidden sm:inline text-sm">{currentPlatform.name}</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80"
        align="start"
        style={{
          '--dropdown-accent': themeColor,
        } as React.CSSProperties}
      >
        <DropdownMenuLabel className="flex items-center gap-2 py-2">
          <Sparkles className="h-4 w-4" style={{ color: themeColor }} />
          <span className="font-bold">FANZ Network</span>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {getAllUserFacingPlatforms().filter(p => p.status === 'active').length} Active
          </Badge>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-[60vh] max-h-[500px]">
          {/* Fan Platforms */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-1.5 py-1.5">
              <Users className="h-3 w-3" />
              Content Platforms
            </DropdownMenuLabel>
            {FAN_PLATFORMS.filter(p => p.isUserFacing).map((platform) => (
              <PlatformItem
                key={platform.id}
                platform={platform}
                isCurrent={platform.id === detectedPlatformId}
                onSelect={handlePlatformSwitch}
                themeColor={themeColor}
              />
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Infrastructure */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-1.5 py-1.5">
              <Settings className="h-3 w-3" />
              Infrastructure
            </DropdownMenuLabel>
            {INFRASTRUCTURE_SERVICES.filter(p => p.isUserFacing).map((platform) => (
              <PlatformItem
                key={platform.id}
                platform={platform}
                isCurrent={platform.id === detectedPlatformId}
                onSelect={handlePlatformSwitch}
                themeColor={themeColor}
              />
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Auxiliary Services */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-1.5 py-1.5">
              <Globe className="h-3 w-3" />
              Services
            </DropdownMenuLabel>
            {AUXILIARY_SERVICES.filter(p => p.isUserFacing).map((platform) => (
              <PlatformItem
                key={platform.id}
                platform={platform}
                isCurrent={platform.id === detectedPlatformId}
                onSelect={handlePlatformSwitch}
                themeColor={themeColor}
              />
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* AI Services */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-1.5 py-1.5">
              <Bot className="h-3 w-3" />
              AI Assistants
            </DropdownMenuLabel>
            {AI_SERVICES.filter(p => p.isUserFacing).map((platform) => (
              <PlatformItem
                key={platform.id}
                platform={platform}
                isCurrent={platform.id === detectedPlatformId}
                onSelect={handlePlatformSwitch}
                themeColor={themeColor}
              />
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Support & Recovery */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-1.5 py-1.5">
              <LifeBuoy className="h-3 w-3" />
              Support
            </DropdownMenuLabel>
            {SUPPORT_SERVICES.filter(p => p.isUserFacing).map((platform) => (
              <PlatformItem
                key={platform.id}
                platform={platform}
                isCurrent={platform.id === detectedPlatformId}
                onSelect={handlePlatformSwitch}
                themeColor={themeColor}
              />
            ))}
          </DropdownMenuGroup>
        </ScrollArea>

        <DropdownMenuSeparator />

        {/* Quick Actions Footer */}
        <div className="p-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => window.location.href = 'https://recoveryfanz.com'}
          >
            <LifeBuoy className="h-3 w-3 mr-1.5" />
            Get Help
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => window.location.href = 'https://dash.fanz.website'}
          >
            <Cpu className="h-3 w-3 mr-1.5" />
            Dashboard
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UniversalPlatformSwitcher;
