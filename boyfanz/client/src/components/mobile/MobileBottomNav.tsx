// @ts-nocheck
/**
 * Mobile Bottom Navigation
 *
 * iOS/Android-style bottom tab bar for mobile PWA experience.
 * Shows 5 key navigation items with active states and badges.
 */

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  Search,
  PlusSquare,
  MessageCircle,
  User,
  Bell,
  Compass,
  Video,
  Wallet,
} from "lucide-react";

interface NavItem {
  path: string;
  icon: typeof Home;
  label: string;
  badge?: number;
  requiresAuth?: boolean;
}

export function MobileBottomNav() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Fetch unread counts
  const { data: notificationData } = useQuery({
    queryKey: ['/api/social-notifications'],
    enabled: isAuthenticated,
  });

  const { data: messageData } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    enabled: isAuthenticated,
  });

  const unreadNotifications = notificationData?.unreadCount || 0;
  const unreadMessages = messageData?.count || 0;

  const navItems: NavItem[] = [
    {
      path: isAuthenticated ? "/social" : "/",
      icon: Home,
      label: "Home",
    },
    {
      path: "/search",
      icon: Compass,
      label: "Explore",
    },
    {
      path: "/starz-studio",
      icon: PlusSquare,
      label: "Create",
      requiresAuth: true,
    },
    {
      path: "/messages",
      icon: MessageCircle,
      label: "Messages",
      badge: unreadMessages,
      requiresAuth: true,
    },
    {
      path: user?.role === 'creator' ? `/creator/${user?.id}` : "/settings",
      icon: User,
      label: "Profile",
      requiresAuth: true,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/" || path === "/social") {
      return location === "/" || location === "/social";
    }
    return location.startsWith(path);
  };

  // Don't show on auth pages
  const authPages = ['/auth/', '/login', '/signup', '/register'];
  if (authPages.some(page => location.includes(page))) {
    return null;
  }

  // Filter items based on auth
  const visibleItems = navItems.filter(item => {
    if (item.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 md:hidden" aria-hidden="true" />

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 touch-manipulation",
                  "min-h-[56px] min-w-[56px]", // Touch target
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-transform",
                      active && "scale-110"
                    )}
                    aria-hidden="true"
                  />
                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1"
                      aria-label={`${item.badge} unread`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-1 font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* iOS Safe Area */}
        <div className="h-safe-area-bottom bg-card" />
      </nav>
    </>
  );
}

export default MobileBottomNav;
