import { useState, useRef, useEffect } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { ChevronDown, ExternalLink, Shield, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformSwitcherProps {
  variant?: 'header' | 'sidebar' | 'mobile';
  className?: string;
}

export function PlatformSwitcher({ variant = 'header', className }: PlatformSwitcherProps) {
  const { currentPlatform, availablePlatforms, switchPlatform, isAdminOverride, clearOverride, isLoading } = usePlatform();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const filteredPlatforms = availablePlatforms.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSwitch = async (platformId: string) => {
    if (platformId === currentPlatform.id) {
      setIsOpen(false);
      return;
    }

    try {
      await switchPlatform(platformId);
    } catch (error) {
      console.error('Platform switch failed:', error);
    }
  };

  const handleClearOverride = async () => {
    try {
      await clearOverride();
    } catch (error) {
      console.error('Failed to clear override:', error);
    }
  };

  // Render compact sidebar variant
  if (variant === 'sidebar') {
    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
            "bg-black/20 hover:bg-black/30 border border-white/10 hover:border-white/20",
            isAdminOverride && "border-yellow-500/50 bg-yellow-500/10"
          )}
          disabled={isLoading}
        >
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: currentPlatform.primaryColor }}
          >
            {currentPlatform.name[0]}
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-white">{currentPlatform.name}</div>
            <div className="text-xs text-gray-400">{currentPlatform.tagline}</div>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-white/20 rounded-lg shadow-2xl max-h-[400px] overflow-hidden z-50">
            {isAdminOverride && (
              <div className="p-3 bg-yellow-500/10 border-b border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400">Admin Override Active</span>
                  </div>
                  <button
                    onClick={handleClearOverride}
                    className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div className="p-2 border-b border-white/10">
              <input
                type="text"
                placeholder="Search platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="overflow-y-auto max-h-[300px]">
              {filteredPlatforms.map((platform) => {
                const isCurrent = platform.id === currentPlatform.id;

                return (
                  <button
                    key={platform.id}
                    onClick={() => handleSwitch(platform.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left",
                      isCurrent && "bg-white/10"
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: platform.primaryColor }}
                    >
                      {platform.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{platform.name}</span>
                        {isCurrent && <Check className="h-3 w-3 text-green-400" />}
                      </div>
                      <div className="text-xs text-gray-400 truncate">{platform.tagline}</div>
                    </div>
                    {platform.status === 'pending_audit' && (
                      <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">Beta</span>
                    )}
                  </button>
                );
              })}

              {filteredPlatforms.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No platforms found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default header variant
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
          "bg-black/20 hover:bg-black/30 border border-white/10 hover:border-white/20",
          isAdminOverride && "border-yellow-500/50 bg-yellow-500/10"
        )}
        disabled={isLoading}
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: currentPlatform.primaryColor }}
        >
          {currentPlatform.name[0]}
        </div>
        <span className="text-sm font-semibold text-white hidden md:inline">{currentPlatform.name}</span>
        {isAdminOverride && <Shield className="h-3 w-3 text-yellow-400" />}
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-zinc-900 border border-white/20 rounded-lg shadow-2xl overflow-hidden z-50">
          {isAdminOverride && (
            <div className="p-3 bg-yellow-500/10 border-b border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">Admin Override Active</span>
                </div>
                <button
                  onClick={handleClearOverride}
                  className="p-1 hover:bg-yellow-500/20 rounded transition-colors"
                >
                  <X className="h-3 w-3 text-yellow-400" />
                </button>
              </div>
              <p className="text-xs text-yellow-300/70 mt-1">
                You are viewing {currentPlatform.name} as an admin
              </p>
            </div>
          )}

          <div className="p-3 border-b border-white/10">
            <input
              type="text"
              placeholder="Search platforms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto max-h-96">
            <div className="p-2 space-y-1">
              {filteredPlatforms.map((platform) => {
                const isCurrent = platform.id === currentPlatform.id;

                return (
                  <button
                    key={platform.id}
                    onClick={() => handleSwitch(platform.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-left group",
                      isCurrent && "bg-white/10"
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: platform.primaryColor }}
                    >
                      {platform.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{platform.name}</span>
                        {isCurrent && <Check className="h-4 w-4 text-green-400" />}
                        {!isCurrent && <ExternalLink className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                      <div className="text-xs text-gray-400">{platform.tagline}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{platform.domain}</div>
                    </div>
                    {platform.status === 'pending_audit' && (
                      <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded font-medium">Beta</span>
                    )}
                    {platform.status === 'coming_soon' && (
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-medium">Soon</span>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredPlatforms.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-gray-500 text-sm">No platforms match your search</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 bg-black/20">
            <div className="text-xs text-gray-400 text-center">
              {availablePlatforms.length} platforms available
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
