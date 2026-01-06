import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { BoostedPostsCarousel } from "@/components/sidebar/BoostedPostsCarousel";

// Sidebar collapse context
const SidebarCollapseContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
} | null>(null);

export function useSidebarCollapse() {
  const context = useContext(SidebarCollapseContext);
  if (!context) {
    return { isCollapsed: false, setIsCollapsed: () => {} };
  }
  return context;
}

// Sidebar Promo Ad Component
function SidebarPromoAd() {
  const promos = [
    {
      gradient: "from-red-600 to-red-800",
      title: "Go Premium",
      description: "Get 10% bonus on all earnings",
      cta: "Upgrade"
    },
    {
      gradient: "from-purple-600 to-indigo-700",
      title: "FanzCoins",
      description: "Buy FanzCoins & save 5%",
      cta: "Buy Now"
    },
    {
      gradient: "from-amber-500 to-orange-600",
      title: "Refer & Earn",
      description: "Get premium ecosystem access",
      cta: "Share Link"
    }
  ];

  const promo = promos[Math.floor(Math.random() * promos.length)];

  return (
    <div className={`mx-3 my-4 p-4 rounded-xl bg-gradient-to-br ${promo.gradient} relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
      }} />
      <div className="relative z-10">
        <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Sponsored</p>
        <p className="font-bebas text-lg text-white">{promo.title}</p>
        <p className="text-xs text-white/80 mb-2">{promo.description}</p>
        <button className="w-full px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors">
          {promo.cta}
        </button>
      </div>
    </div>
  );
}

interface SidebarProps {
  user: any;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logoutMutation } = useAuth();
  const {
    hasAdminAccess,
    canAccessSection,
    canAccessRoute,
    isAdmin,
    isModerator,
  } = usePermissions();

  const isActive = (path: string) => location === path;

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/');
      }
    });
  };
  
  const handleMobileLinkClick = () => {
    setMobileOpen(false);
  };
  
  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home" },
    { path: "/infinity-feed", icon: "fas fa-infinity", label: "Infinity Feed" },
    { path: "/fanz-money-center", icon: "fas fa-wallet", label: "FanzMoneyCenter" },
    { path: `/creator/${user?.id}`, icon: "fas fa-user", label: "My page" },
    { path: "/dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { path: "/starz-studio", icon: "fas fa-star", label: "Starz Studio" },
    { path: "/analytics", icon: "fas fa-chart-line", label: "Analytics" },
    { path: "/notifications", icon: "fas fa-bell", label: "Notifications", dot: true },
    { path: "/messages", icon: "fas fa-comments", label: "Messages", dot: true },
    { path: "/search", icon: "fas fa-search", label: "Explore" },
    { path: "/subscriptions", icon: "fas fa-star", label: "Subscriptions" },
    { path: "/purchased", icon: "fas fa-shopping-bag", label: "Purchased" },
    { path: "/custom-requests", icon: "fas fa-gift", label: "Custom Requests" },
    { path: "/wallet", icon: "fas fa-credit-card", label: "Wallet" },
    { path: "/referrals", icon: "fas fa-user-plus", label: "Referrals" },
    { path: "/stories", icon: "fas fa-clock", label: "My Stories" },
    { path: "/release-forms", icon: "fas fa-file-contract", label: "Release Forms" },
    { path: "/nearby", icon: "fas fa-map-marker-alt", label: "Near by me" },
    { path: "/forums", icon: "fas fa-comments", label: "Forums" },
    { path: "/outlawz", icon: "fas fa-skull-crossbones", label: "Outlawz", badge: "HOT" },
    { path: "/settings", icon: "fas fa-cog", label: "Settings" },
  ] as Array<{ path: string; icon: string; label: string; dot?: boolean; badge?: string }>;

  // FanzTube section items
  const tubeItems = [
    { path: "/tube", icon: "fas fa-play-circle", label: "FanzTube" },
    { path: "/tube/gay", icon: "fas fa-rainbow", label: "Gay Tube" },
    { path: "/tube/hunks", icon: "fas fa-dumbbell", label: "Hunks" },
    { path: "/tube/broz", icon: "fas fa-users", label: "Broz" },
    { path: "/tube/categories", icon: "fas fa-th-large", label: "All Categories", badge: "NEW" },
  ];

  // FANZ Ecosystem - Auxiliary Platforms
  const ecosystemItems = [
    { path: "/starz-studio", icon: "fas fa-star", label: "Starz Studio", badge: "CREATOR" },
    { path: "/fanz-defend", icon: "fas fa-shield-alt", label: "FanzDefend" },
    { path: "/fanz-forge", icon: "fas fa-hammer", label: "FanzForge" },
    { path: "/fanz-filiate", icon: "fas fa-handshake", label: "FanzFiliate" },
    { path: "/fanz-varsity", icon: "fas fa-graduation-cap", label: "FanzVarsity" },
    { path: "/fanz-meet", icon: "fas fa-video", label: "FanzMeet" },
    { path: "/fanz-swipe", icon: "fas fa-heart", label: "FanzSwipe", badge: "DATING" },
    { path: "/fanz-world", icon: "fas fa-globe-americas", label: "FanzWorld" },
    { path: "/starz-cardz", icon: "fas fa-id-card", label: "StarzCardz" },
    { path: "/wicked-crm", icon: "fas fa-address-book", label: "WickedCRM", badge: "PRO" },
  ];

  // FANZ Security & Architecture
  const securityItems = [
    { path: "/fanz-cybersecure", icon: "fas fa-lock", label: "FanzCyberSecure" },
    { path: "/fanz-singularity", icon: "fas fa-atom", label: "FANZ Singularity" },
  ];

  // Mobile Apps
  const mobileItems = [
    { path: "/fanz-incognito", icon: "fas fa-user-secret", label: "FanzIncognito", badge: "APP" },
    { path: "/fanz-cloud", icon: "fas fa-cloud", label: "FanzCloud", badge: "APP" },
  ];

  // Add streaming and events items to main nav for easy access
  if (user?.role === 'creator' || user?.role === 'admin' || user?.role === 'moderator') {
    navItems.splice(2, 0, { path: "/streams", icon: "fas fa-broadcast-tower", label: "Live Streams" });
    navItems.splice(3, 0, { path: "/events", icon: "fas fa-calendar-star", label: "Live Events" });
  } else {
    // Fans can view events too
    navItems.splice(2, 0, { path: "/events", icon: "fas fa-calendar-star", label: "Live Events" });
  }

  const adminItems = [
    { path: "/panel/admin/dashboard", icon: "fas fa-tachometer-alt", label: "Admin Dashboard" },
    { path: "/panel/admin/complaints", icon: "fas fa-exclamation-triangle", label: "Complaints Management" },
    { path: "/panel/admin/withdrawals", icon: "fas fa-money-bill-wave", label: "Withdrawals & Payouts" },
    { path: "/panel/admin/verification", icon: "fas fa-shield-alt", label: "Verification Requests" },
    { path: "/panel/admin/moderation", icon: "fas fa-tasks", label: "Moderation Queue", badge: "7" },
    { path: "/panel/admin/users", icon: "fas fa-users", label: "User Management" },
    { path: "/panel/admin/delegation", icon: "fas fa-key", label: "Delegation Manager" },
    { path: "/panel/admin/themes", icon: "fas fa-palette", label: "Theme Manager" },
    { path: "/panel/admin/reports", icon: "fas fa-chart-bar", label: "Reports & Analytics" },
  ];

  const contentManagementItems = [
    { path: "/panel/admin/posts", icon: "fas fa-file-alt", label: "Posts Management" },
    { path: "/panel/admin/streaming", icon: "fas fa-broadcast-tower", label: "Live Streaming" },
    { path: "/panel/admin/stories", icon: "fas fa-clock", label: "Stories Management" },
    { path: "/panel/admin/shop", icon: "fas fa-store", label: "Shop Management" },
    { path: "/panel/admin/categories", icon: "fas fa-folder-tree", label: "Categories Management" },
    { path: "/panel/admin/forums", icon: "fas fa-comments", label: "Forums Moderation" },
    { path: "/panel/admin/messages", icon: "fas fa-envelope-open-text", label: "Messages Moderation" },
  ];

  const financialManagementItems = [
    { path: "/panel/admin/transactions", icon: "fas fa-exchange-alt", label: "Transactions" },
    { path: "/panel/admin/billing", icon: "fas fa-file-invoice", label: "Billing Management" },
    { path: "/panel/admin/tax-rates", icon: "fas fa-percentage", label: "Tax Rates" },
    { path: "/panel/admin/payment-settings", icon: "fas fa-cogs", label: "Payment Settings" },
    { path: "/panel/admin/deposits", icon: "fas fa-wallet", label: "Deposits" },
  ];

  const systemManagementItems = [
    { path: "/panel/admin/platforms", icon: "fas fa-globe", label: "Platform Management" },
    { path: "/panel/admin/cloud-storage", icon: "fas fa-cloud", label: "Cloud Storage (CDN)" },
    { path: "/panel/admin/announcements", icon: "fas fa-bullhorn", label: "Announcements" },
    { path: "/panel/admin/push-notifications", icon: "fas fa-bell", label: "Push Notifications" },
    { path: "/panel/admin/email-marketing", icon: "fas fa-envelope", label: "Email Marketing" },
    { path: "/panel/admin/system-settings", icon: "fas fa-cog", label: "System Settings" },
    { path: "/panel/admin/branding", icon: "fas fa-paint-brush", label: "Branding Assets" },
    { path: "/panel/admin/bookings", icon: "fas fa-calendar-check", label: "Booking Management" },
    { path: "/panel/admin/appearance", icon: "fas fa-magic", label: "Site Appearance" },
    { path: "/panel/admin/gallery", icon: "fas fa-images", label: "Gallery Management" },
    { path: "/panel/admin/oauth-settings", icon: "fas fa-key", label: "Social Login" },
    { path: "/panel/admin/storage", icon: "fas fa-hdd", label: "Storage Management" },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo - Clickable to go to home/feed */}
      <Link href="/social">
        <div className={cn(
          "flex-shrink-0 flex h-16 md:h-20 items-center border-b border-border cursor-pointer hover:bg-accent/10 transition-all",
          isCollapsed ? "px-2 justify-center" : "px-4 md:px-6"
        )}>
          <div className={cn("flex items-center", isCollapsed ? "flex-col gap-0" : "gap-2 md:gap-3")}>
            <img
              src="/boyfanz-logo.png"
              alt="BoyFanz Logo"
              className={cn("w-auto transition-all", isCollapsed ? "h-6" : "h-8 md:h-12")}
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg md:text-xl neon-sign tracking-wider">BoyFanz</span>
                <span className="text-xs neon-sign-golden font-heading font-semibold tracking-wide uppercase hidden sm:block">Every Man's Playground</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Collapse/Expand Button - Desktop Only */}
      {!isMobile && (
        <div className="flex justify-end px-2 py-2 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 hover:bg-primary/10"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
        isCollapsed ? "px-1" : "px-3"
      )} data-testid="sidebar-nav">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 rounded-md text-sm font-medium transition-all",
                isCollapsed ? "px-2 py-2 justify-center" : "px-3 py-3 md:py-2 touch-target min-h-[44px] md:min-h-[36px]",
                isActive(item.path)
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              title={isCollapsed ? item.label : undefined}
            >
              <i className={cn(item.icon, isCollapsed ? "w-5 h-5" : "w-5 h-5 md:w-4 md:h-4")}></i>
              {!isCollapsed && (
                <>
                  {item.label}
                  {item.badge && (
                    <span className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded-full font-bold",
                      item.badge === "KYC"
                        ? "bg-yellow-500 text-yellow-900"
                        : item.badge === "HOT"
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse"
                        : "bg-primary text-primary-foreground"
                    )}>
                      {item.badge === "HOT" ? "🔥 HOT" : item.badge}
                    </span>
                  )}
                  {item.dot && (
                    <span className="ml-auto w-2 h-2 bg-primary rounded-full notification-dot"></span>
                  )}
                </>
              )}
              {isCollapsed && (item.dot || item.badge) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              )}
            </Link>
          ))}
        </div>

        {/* FanzTube Section */}
        {!isCollapsed && (
          <div className="mt-6 md:mt-8">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              FanzTube
            </h3>
            <div className="mt-2 space-y-1">
              {tubeItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={isMobile ? handleMobileLinkClick : undefined}
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                    isActive(item.path)
                      ? "active bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-5 h-5 md:w-4 md:h-4`}></i>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FANZ Ecosystem Section */}
        {!isCollapsed && (
          <div className="mt-6 md:mt-8">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              FANZ Ecosystem
            </h3>
            <div className="mt-2 space-y-1">
              {ecosystemItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={isMobile ? handleMobileLinkClick : undefined}
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                    isActive(item.path)
                      ? "active bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-5 h-5 md:w-4 md:h-4`}></i>
                  {item.label}
                  {item.badge && (
                    <span className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded-full font-medium",
                      item.badge === "CREATOR" ? "bg-purple-500 text-white" :
                      item.badge === "DATING" ? "bg-pink-500 text-white" :
                      item.badge === "PRO" ? "bg-amber-500 text-black" :
                      "bg-primary text-primary-foreground"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Apps Section */}
        {!isCollapsed && (
          <div className="mt-6 md:mt-8">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mobile Apps
            </h3>
            <div className="mt-2 space-y-1">
              {mobileItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={isMobile ? handleMobileLinkClick : undefined}
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                    isActive(item.path)
                      ? "active bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-5 h-5 md:w-4 md:h-4`}></i>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Security & Architecture Section */}
        {!isCollapsed && (
          <div className="mt-6 md:mt-8">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Security & Architecture
            </h3>
            <div className="mt-2 space-y-1">
              {securityItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={isMobile ? handleMobileLinkClick : undefined}
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                    isActive(item.path)
                      ? "active bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-5 h-5 md:w-4 md:h-4`}></i>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Become a Creator CTA for Fans */}
        {user?.role === 'fan' && !isCollapsed && (
          <div className="mt-6 md:mt-8 px-3">
            <Link
              href="/become-creator"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold transition-all shadow-lg hover:shadow-cyan-500/25 group"
              data-testid="nav-become-creator"
            >
              <i className="fas fa-star w-5 h-5 group-hover:animate-pulse"></i>
              <span className="font-display tracking-wide">Become a Creator</span>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Start earning from your content today!
            </p>
          </div>
        )}

        {/* Promotional Ad - Desktop Only */}
        {!isCollapsed && (
          <div className="hidden md:block">
            <SidebarPromoAd />
          </div>
        )}

        {/* Boosted Posts Carousel - Collapsed Sidebar Only */}
        {isCollapsed && (
          <div className="hidden md:block px-2">
            <BoostedPostsCarousel />
          </div>
        )}

        {/* Creator Section */}
        {(user?.role === 'creator' || user?.role === 'admin' || user?.role === 'moderator') && (
          <div className="mt-6 md:mt-8">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Creator
              </h3>
            )}
            <div className={cn("space-y-1", !isCollapsed && "mt-2")}>
              <Link 
                href="/streams/create"
                onClick={isMobile ? handleMobileLinkClick : undefined}
                className={cn(
                  "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                  isActive("/streams/create")
                    ? "active bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid="nav-create-stream"
              >
                <i className="fas fa-video w-5 h-5 md:w-4 md:h-4"></i>
                Create Stream
              </Link>
              <Link 
                href="/events/host"
                onClick={isMobile ? handleMobileLinkClick : undefined}
                className={cn(
                  "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                  isActive("/events/host")
                    ? "active bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid="nav-host-event"
              >
                <i className="fas fa-calendar-plus w-5 h-5 md:w-4 md:h-4"></i>
                Host Event
              </Link>
              <Link
                href="/earnings"
                onClick={isMobile ? handleMobileLinkClick : undefined}
                className={cn(
                  "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                  isActive("/earnings")
                    ? "active bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid="nav-earnings"
              >
                <i className="fas fa-chart-line w-5 h-5 md:w-4 md:h-4"></i>
                Earnings
              </Link>
              <Link
                href="/free-links"
                onClick={isMobile ? handleMobileLinkClick : undefined}
                className={cn(
                  "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                  isActive("/free-links")
                    ? "active bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid="nav-free-links"
              >
                <i className="fas fa-link w-5 h-5 md:w-4 md:h-4"></i>
                Free Links
              </Link>
              <Link
                href="/creator-requests"
                onClick={isMobile ? handleMobileLinkClick : undefined}
                className={cn(
                  "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                  isActive("/creator-requests")
                    ? "active bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid="nav-creator-requests"
              >
                <i className="fas fa-gift w-5 h-5 md:w-4 md:h-4"></i>
                Custom Requests
              </Link>

              {/* Fuck Buddies List Settings */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <Link
                  href="/"
                  onClick={isMobile ? handleMobileLinkClick : undefined}
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                    isActive("/")
                      ? "active bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid="nav-fuck-buddies-settings"
                >
                  <i className="fas fa-users-cog w-5 h-5 md:w-4 md:h-4"></i>
                  {!isCollapsed && <span>Fuck Buddies List</span>}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Privacy & Security Section */}
        <div className="mt-6 md:mt-8">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Privacy & Security
          </h3>
          <div className="mt-2 space-y-1">
            <Link
              href="/settings/privacy"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/settings/privacy")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <i className="fas fa-shield-alt w-5 h-5 md:w-4 md:h-4"></i>
              Privacy Settings
            </Link>
            <Link
              href="/settings/password"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/settings/password")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <i className="fas fa-lock w-5 h-5 md:w-4 md:h-4"></i>
              Password
            </Link>
            <Link
              href="/settings/countries"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/settings/countries")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <i className="fas fa-globe w-5 h-5 md:w-4 md:h-4"></i>
              Block Countries
            </Link>
            <Link
              href="/settings/restricted"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/settings/restricted")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <i className="fas fa-user-slash w-5 h-5 md:w-4 md:h-4"></i>
              Restricted Users
            </Link>
          </div>
        </div>

        {/* Payments Section */}
        <div className="mt-6 md:mt-8">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Payments
          </h3>
          <div className="mt-2 space-y-1">
            <Link
              href="/payments"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/payments")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <i className="fas fa-credit-card w-5 h-5 md:w-4 md:h-4"></i>
              Payment Methods
            </Link>
            <Link
              href="/payments/received"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/payments/received")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <i className="fas fa-hand-holding-usd w-5 h-5 md:w-4 md:h-4"></i>
              Payments Received
            </Link>
            <Link
              href="/payouts"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/payouts")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <i className="fas fa-money-bill-wave w-5 h-5 md:w-4 md:h-4"></i>
              Payout Method
            </Link>
            <Link
              href="/withdrawals"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/withdrawals")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <i className="fas fa-wallet w-5 h-5 md:w-4 md:h-4"></i>
              Withdrawals
            </Link>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-6 md:mt-8">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Support & Help
          </h3>
          <div className="mt-2 space-y-1">
            <Link 
              href="/help"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/help")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="nav-help-center"
            >
              <i className="fas fa-question-circle w-5 h-5 md:w-4 md:h-4"></i>
              Help Center
            </Link>
            <Link 
              href="/help/wiki"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/help/wiki")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="nav-ai-wiki"
            >
              <i className="fas fa-brain w-5 h-5 md:w-4 md:h-4"></i>
              AI Wiki
            </Link>
            <Link 
              href="/help/tutorials"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/help/tutorials")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="nav-tutorials"
            >
              <i className="fas fa-play-circle w-5 h-5 md:w-4 md:h-4"></i>
              Tutorials
            </Link>
            <Link 
              href="/help/tickets"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/help/tickets")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="nav-support-tickets"
            >
              <i className="fas fa-ticket-alt w-5 h-5 md:w-4 md:h-4"></i>
              Support Tickets
            </Link>
            <Link 
              href="/help/chat"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/help/chat")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="nav-ai-chat"
            >
              <i className="fas fa-robot w-5 h-5 md:w-4 md:h-4"></i>
              AI Chat Support
            </Link>
            <Link 
              href="/blog"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/blog")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="nav-blog"
            >
              <i className="fas fa-blog w-5 h-5 md:w-4 md:h-4"></i>
              Blog
            </Link>
            <Link
              href="/contact"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/contact")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="nav-contact"
            >
              <i className="fas fa-envelope w-5 h-5 md:w-4 md:h-4"></i>
              Contact
            </Link>
            <Link
              href="/forums"
              onClick={isMobile ? handleMobileLinkClick : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                isActive("/forums")
                  ? "active bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="nav-forums"
            >
              <i className="fas fa-comments w-5 h-5 md:w-4 md:h-4"></i>
              Community Forums
            </Link>
          </div>
        </div>

        {/* Admin Section */}
        {(user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'super_admin' || user?.role === 'ceo') && (
          <div className="mt-6 md:mt-8">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administration
            </h3>
            <div className="mt-2 space-y-1">
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={isMobile ? handleMobileLinkClick : undefined}
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                    isActive(item.path)
                      ? "active bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-5 h-5 md:w-4 md:h-4`}></i>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Content Management Section */}
        {(user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'super_admin' || user?.role === 'ceo') && (
          <div className="mt-6 md:mt-8">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Content Management
            </h3>
            <div className="mt-2 space-y-1">
              {contentManagementItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={isMobile ? handleMobileLinkClick : undefined}
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                    isActive(item.path)
                      ? "active bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-5 h-5 md:w-4 md:h-4`}></i>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Financial Management Section */}
        {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'ceo') && (
          <div className="mt-6 md:mt-8">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Financial Management
            </h3>
            <div className="mt-2 space-y-1">
              {financialManagementItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={isMobile ? handleMobileLinkClick : undefined}
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                    isActive(item.path)
                      ? "active bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-5 h-5 md:w-4 md:h-4`}></i>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* System Management Section */}
        {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'ceo') && (
          <div className="mt-6 md:mt-8">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System Management
            </h3>
            <div className="mt-2 space-y-1">
              {systemManagementItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={isMobile ? handleMobileLinkClick : undefined}
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
                    isActive(item.path)
                      ? "active bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-5 h-5 md:w-4 md:h-4`}></i>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mt-6 md:mt-8">
          <Link 
            href="/settings"
            onClick={isMobile ? handleMobileLinkClick : undefined}
            className={cn(
              "sidebar-link flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-all touch-target min-h-[44px] md:min-h-[36px]",
              isActive("/settings")
                ? "active bg-primary/10 text-primary border-r-2 border-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            data-testid="nav-settings"
          >
            <i className="fas fa-cog w-5 h-5 md:w-4 md:h-4"></i>
            Settings
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="flex-shrink-0 border-t border-border p-4">
        <div className="flex items-center gap-3">
          <img
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"}
            alt="User Avatar"
            className="h-8 w-8 md:h-10 md:w-10 rounded-full ring-2 ring-primary/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{user?.username}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
            title="Sign Out"
            aria-label="Sign out of your account"
            data-testid="sign-out-button"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile sidebar using Sheet
  if (isMobile) {
    return (
      <>
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur border border-border"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
          data-testid="mobile-menu-trigger"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Mobile sidebar sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="w-80 p-0 bg-card border-r retro-border smoky-bg"
            id="mobile-sidebar"
            aria-label="Main navigation"
          >
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop sidebar
  return (
    <SidebarCollapseContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r retro-border smoky-bg transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
        data-testid="sidebar"
        role="navigation"
        aria-label="Main navigation"
      >
        {sidebarContent}
      </aside>
    </SidebarCollapseContext.Provider>
  );
}