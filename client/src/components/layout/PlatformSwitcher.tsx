import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Lock,
  ExternalLink,
  ChevronDown,
  Network,
  Heart,
  Users,
  Star,
  Flame,
  Crown,
  Shield,
  Moon,
  Sun,
  Compass,
  Sparkles,
  Dumbbell,
  Palette,
  Globe,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// BoyFanz Underground Theme
const THEME = {
  neonBlue: '#00D4FF',
  neonPink: '#FF00FF',
  darkBg: '#0A0A0F',
  goldAccent: '#FFD700',
};

// Platform type definitions
interface Platform {
  id: string;
  name: string;
  url: string;
  slogan: string;
  iconType: React.ComponentType<{ className?: string }>;
  colors: string;
  group: 'main' | 'niche' | 'exclusive';
}

// Active FANZ platforms
const ACTIVE_PLATFORMS: Platform[] = [
  {
    id: 'boyfanz',
    name: 'BoyFanz',
    url: 'boy.fanz.website',
    slogan: "Every Man's Playground",
    iconType: Zap,
    colors: 'from-cyan-500 to-blue-600',
    group: 'main',
  },
  {
    id: 'girlfanz',
    name: 'GirlFanz',
    url: 'girl.fanz.website',
    slogan: 'Express Yourself Freely',
    iconType: Heart,
    colors: 'from-pink-500 to-rose-600',
    group: 'main',
  },
  {
    id: 'gayfanz',
    name: 'GayFanz',
    url: 'gay.fanz.website',
    slogan: 'Pride & Connection',
    iconType: Star,
    colors: 'from-purple-500 to-violet-600',
    group: 'main',
  },
  {
    id: 'transfanz',
    name: 'TransFanz',
    url: 'trans.fanz.website',
    slogan: 'Celebrate Your True Self',
    iconType: Sparkles,
    colors: 'from-sky-400 via-pink-400 to-white',
    group: 'main',
  },
  {
    id: 'femmefanz',
    name: 'FemmeFanz',
    url: 'femme.fanz.website',
    slogan: 'Feminine Energy',
    iconType: Moon,
    colors: 'from-fuchsia-500 to-pink-600',
    group: 'main',
  },
  {
    id: 'bearfanz',
    name: 'BearFanz',
    url: 'bear.fanz.website',
    slogan: 'Bear Community',
    iconType: Shield,
    colors: 'from-amber-600 to-yellow-500',
    group: 'niche',
  },
  {
    id: 'daddyfanz',
    name: 'DaddyFanz',
    url: 'daddy.fanz.website',
    slogan: 'Experience Matters',
    iconType: Crown,
    colors: 'from-slate-500 to-zinc-600',
    group: 'niche',
  },
  {
    id: 'pupfanz',
    name: 'PupFanz',
    url: 'pup.fanz.website',
    slogan: 'Playful Community',
    iconType: Heart,
    colors: 'from-emerald-500 to-teal-600',
    group: 'niche',
  },
  {
    id: 'milffanz',
    name: 'MilfFanz',
    url: 'milf.fanz.website',
    slogan: 'Mature & Confident',
    iconType: Flame,
    colors: 'from-red-500 to-rose-600',
    group: 'niche',
  },
  {
    id: 'cougarfanz',
    name: 'CougarFanz',
    url: 'cougar.fanz.website',
    slogan: 'Fierce & Fabulous',
    iconType: Flame,
    colors: 'from-orange-500 to-amber-600',
    group: 'niche',
  },
  {
    id: 'brofanz',
    name: 'BroFanz',
    url: 'bro.fanz.website',
    slogan: 'Brotherhood Vibes',
    iconType: Users,
    colors: 'from-amber-500 to-orange-600',
    group: 'niche',
  },
  {
    id: 'southernfanz',
    name: 'SouthernFanz',
    url: 'southern.fanz.website',
    slogan: 'Southern Charm',
    iconType: Sun,
    colors: 'from-yellow-500 to-orange-500',
    group: 'niche',
  },
  {
    id: 'dlbroz',
    name: 'DLBroz',
    url: 'dlbroz.com',
    slogan: 'Discreet Connection',
    iconType: Shield,
    colors: 'from-gray-600 to-slate-700',
    group: 'exclusive',
  },
  {
    id: 'guyz',
    name: 'Guyz',
    url: 'guyz.world',
    slogan: 'Just the Guyz',
    iconType: Users,
    colors: 'from-indigo-500 to-blue-600',
    group: 'exclusive',
  },
  {
    id: 'taboofanz',
    name: 'TabooFanz',
    url: 'taboo.fanz.website',
    slogan: 'Beyond Boundaries',
    iconType: Flame,
    colors: 'from-red-600 to-rose-700',
    group: 'exclusive',
  },
  {
    id: 'fanzuncut',
    name: 'FanzUncut',
    url: 'uncut.fanz.website',
    slogan: 'Unfiltered Content',
    iconType: Compass,
    colors: 'from-purple-600 to-indigo-700',
    group: 'exclusive',
  },
];

// Coming Soon platforms - greyed out
const UPCOMING_PLATFORMS = [
  { id: 'latinofanz', name: 'LatinoFanz', slogan: 'Caliente Content', iconType: Sun },
  { id: 'asiafanz', name: 'AsiaFanz', slogan: 'Eastern Allure', iconType: Globe },
  { id: 'fitfanz', name: 'FitFanz', slogan: 'Fitness & Physique', iconType: Dumbbell },
  { id: 'inkfanz', name: 'InkFanz', slogan: 'Tattoo & Alternative', iconType: Palette },
  { id: 'cosplayfanz', name: 'CosplayFanz', slogan: 'Fantasy Creations', iconType: Sparkles },
  { id: 'couplesfanz', name: 'CouplesFanz', slogan: 'Shared Passion', iconType: Heart },
];

const SECTION_LABELS: Record<string, string> = {
  main: 'Featured Platforms',
  niche: 'Community Spaces',
  exclusive: 'Exclusive Access',
};

export default function PlatformSwitcher() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Get user platform permissions
  const { data: accessList } = useQuery<Array<{ platform_id: string; has_access: boolean }>>({
    queryKey: ['/api/user/platform-access'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/user/platform-access', { credentials: 'include' });
        return res.ok ? res.json() : [];
      } catch {
        return [];
      }
    },
    staleTime: 300000,
  });

  // Generate SSO handoff token
  const generateSsoToken = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/sso-token', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const { token } = await res.json();
        return token;
      }
    } catch (err) {
      console.error('SSO token generation failed:', err);
    }
    return null;
  };

  // Navigate to another platform
  const switchToPlatform = async (target: Platform) => {
    if (target.id === 'boyfanz') {
      setMenuOpen(false);
      return;
    }
    const ssoToken = await generateSsoToken();
    const destination = `https://${target.url}`;
    window.location.href = ssoToken ? `${destination}?sso_token=${encodeURIComponent(ssoToken)}` : destination;
  };

  // Check platform access
  const canAccess = (platformId: string): boolean => {
    if (!accessList) return false;
    const entry = accessList.find((a) => a.platform_id === platformId);
    return entry?.has_access ?? false;
  };

  // Organize platforms by group
  const organizedPlatforms = ACTIVE_PLATFORMS.reduce<Record<string, Platform[]>>((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {});

  const currentSite = ACTIVE_PLATFORMS.find((p) => p.id === 'boyfanz')!;

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-10 gap-2 px-3 rounded-lg',
            'bg-black/40 backdrop-blur-sm border border-cyan-500/30',
            'hover:border-cyan-400/60 hover:bg-black/60',
            'transition-all duration-200',
            'neon-glow-subtle'
          )}
        >
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="hidden md:inline text-sm font-semibold neon-text">BoyFanz</span>
          <ChevronDown className={cn('w-4 h-4 text-cyan-400 transition-transform', menuOpen && 'rotate-180')} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(
          'w-72 p-0 overflow-hidden',
          'bg-[#0A0A0F]/98 backdrop-blur-xl',
          'border border-cyan-500/20',
          'rounded-xl shadow-2xl shadow-cyan-500/10'
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold neon-text">FANZ Network</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Switch between platforms</p>
        </div>

        <div className="max-h-[420px] overflow-y-auto py-2 platform-scroll">
          {/* Current Platform */}
          <div className="px-2 mb-2">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-cyan-500/70 px-2">
              You're On
            </DropdownMenuLabel>
            <div className="flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <currentSite.iconType className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{currentSite.name}</span>
                  <Badge className="text-[9px] bg-cyan-500/20 text-cyan-400 border-cyan-500/40 px-1.5">Active</Badge>
                </div>
                <span className="text-[11px] text-cyan-400/70">{currentSite.slogan}</span>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-cyan-500/10" />

          {/* Platform Sections */}
          {(['main', 'niche', 'exclusive'] as const).map((section) => (
            <div key={section} className="px-2 py-1">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-cyan-500/50 px-2 mb-1">
                {SECTION_LABELS[section]}
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {organizedPlatforms[section]
                  ?.filter((p) => p.id !== 'boyfanz')
                  .map((platform) => {
                    const Icon = platform.iconType;
                    const allowed = canAccess(platform.id);

                    return (
                      <DropdownMenuItem
                        key={platform.id}
                        disabled={!allowed}
                        onClick={() => allowed && switchToPlatform(platform)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 mx-1 rounded-lg cursor-pointer',
                          'transition-all duration-150',
                          allowed ? 'hover:bg-cyan-500/10' : 'opacity-40 cursor-not-allowed',
                          'group/platform'
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-md flex items-center justify-center',
                            `bg-gradient-to-br ${platform.colors}`,
                            'group-hover/platform:scale-105 transition-transform shadow-sm'
                          )}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-white block truncate">{platform.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{platform.slogan}</span>
                        </div>
                        {allowed ? (
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-500/40 group-hover/platform:text-cyan-400 transition-colors" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuGroup>
            </div>
          ))}

          <DropdownMenuSeparator className="bg-cyan-500/10 my-1" />

          {/* Coming Soon Section - Greyed Out */}
          <div className="px-2 py-1">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-500 px-2 mb-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Coming Soon
            </DropdownMenuLabel>
            {UPCOMING_PLATFORMS.map((platform) => {
              const Icon = platform.iconType;
              return (
                <div
                  key={platform.id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 mx-1 rounded-lg',
                    'bg-slate-800/30 border border-dashed border-slate-600/30'
                  )}
                >
                  <div className="w-8 h-8 rounded-md bg-slate-700/50 flex items-center justify-center opacity-50">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-500 block truncate">{platform.name}</span>
                    <span className="text-[10px] text-slate-600 block truncate">{platform.slogan}</span>
                  </div>
                  <Badge variant="outline" className="text-[8px] text-slate-500 border-slate-600/40 px-1.5 opacity-60">
                    Soon
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-cyan-500/10 bg-black/30">
          <p className="text-[10px] text-center text-slate-500">
            <span className="text-cyan-400">{ACTIVE_PLATFORMS.length}</span> platforms · <span className="text-slate-400">{UPCOMING_PLATFORMS.length}</span> coming soon
          </p>
        </div>
      </DropdownMenuContent>

      <style>{`
        .neon-text {
          text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }
        .neon-glow-subtle:hover {
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
        }
        .platform-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .platform-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .platform-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.2);
          border-radius: 2px;
        }
        .platform-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.4);
        }
      `}</style>
    </DropdownMenu>
  );
}
