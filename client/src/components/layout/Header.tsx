import { UniversalPlatformSwitcher } from "./UniversalPlatformSwitcher";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell, Search, Settings, Menu, X, Video, User, LogOut, Wallet,
  CreditCard, Shield, HelpCircle, MessageCircle, Heart, Star,
  Upload, BarChart3, Users, Lock, ChevronDown, HeartHandshake, Flame,
  Check
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { AdSpacePlaceholder } from "@/components/ads/AdSpacePlaceholder";

interface HeaderProps {
  user: any;
}

// Notification type icons
const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  wall_post: MessageCircle,
  wall_reaction: Flame,
  wall_comment: MessageCircle,
  wall_mention: Users,
  buddy_request: HeartHandshake,
  buddy_accepted: Heart,
  buddy_top_eight: Star,
  new_post: Upload,
  went_live: Video,
  new_message: MessageCircle,
  verification: Shield,
  payout: Wallet,
  promotion: Star,
};

export default function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const isMobile = useIsMobile();
  const { logoutMutation } = useAuth();
  const { hasAdminAccess } = usePermissions();
  const [, setLocation] = useLocation();

  // Fetch notifications
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['/api/social-notifications'],
    enabled: !!user,
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/auth/login');
      }
    });
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/social-notifications/${notificationId}/read`, { method: 'POST' });
      refetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/social-notifications/read-all', { method: 'POST' });
      refetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  // Time ago helper
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(dateString).toLocaleDateString();
  };

  // WebSocket connection for real-time notifications
  const { isConnected, connectionState } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'new_notification' || message.type === 'tip_received') {
        refetchNotifications();
      }
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setMobileSearchOpen(false);
    }
  };

  return (
    <header
      className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar/95 backdrop-blur dungeon-panel"
      data-testid="header"
      role="banner"
      aria-label="Site header"
    >
      <div className={cn(
        "flex h-14 md:h-16 items-center justify-between px-4 md:px-6",
        isMobile && "pl-16" // Add left padding on mobile to account for hamburger menu
      )}>
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <UniversalPlatformSwitcher />
          {/* Only show connection status when user is logged in and connected */}
          {user && isConnected && (
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span data-testid="system-status">Connected</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Go Live Button for Creators */}
          {(user?.role === 'creator' || user?.role === 'admin' || user?.role === 'moderator') && (
            <Link href="/streams/create">
              <Button 
                variant="default" 
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white hidden md:flex items-center gap-2"
                data-testid="go-live-button"
              >
                <Video className="h-4 w-4" />
                Go Live
              </Button>
            </Link>
          )}

          {/* Search - Hidden on mobile, expandable on tablet+ */}
          <div className="relative hidden md:block" role="search">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 pl-10"
              data-testid="search-input"
              aria-label="Search creators, content, and more"
            />
          </div>
          
          {/* Mobile Search Toggle */}
          <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden touch-target"
                data-testid="mobile-search-button"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto p-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1" role="search">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
                    <Input
                      type="search"
                      placeholder="Search creators, content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 touch-target"
                      data-testid="mobile-search-input"
                      aria-label="Search creators, content, and more"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileSearchOpen(false)}
                    className="touch-target"
                    aria-label="Close search"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>
                <Button type="submit" className="w-full touch-target" disabled={!searchQuery.trim()}>
                  Search
                </Button>
              </form>
            </SheetContent>
          </Sheet>
          
          {/* Notifications Dropdown */}
          <DropdownMenu open={notificationDropdownOpen} onOpenChange={setNotificationDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative touch-target"
                data-testid="notifications-button"
                aria-label={`View notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              >
                <Bell className="h-4 w-4 md:h-4 md:w-4" aria-hidden="true" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    aria-label={`${unreadCount} unread notifications`}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <DropdownMenuLabel className="p-0 font-semibold">
                  Notifications
                </DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-pink-400 hover:text-pink-300"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMarkAllAsRead();
                    }}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[320px]">
                {notifications.length > 0 ? (
                  notifications.slice(0, 10).map((notification: any) => {
                    const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-3 p-3 hover:bg-accent cursor-pointer border-b border-border/50 last:border-0",
                          !notification.isRead && "bg-pink-500/5"
                        )}
                        onClick={() => {
                          if (!notification.isRead) {
                            handleMarkAsRead(notification.id);
                          }
                          if (notification.actionUrl) {
                            setLocation(notification.actionUrl);
                            setNotificationDropdownOpen(false);
                          }
                        }}
                      >
                        {notification.fromUser?.profileImageUrl ? (
                          <Avatar className="h-9 w-9 ring-2 ring-pink-500/20">
                            <AvatarImage src={notification.fromUser.profileImageUrl} />
                            <AvatarFallback className="bg-pink-500/20 text-pink-400 text-xs">
                              {notification.fromUser.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-pink-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm line-clamp-2",
                            !notification.isRead && "font-medium"
                          )}>
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {timeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-pink-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                )}
              </ScrollArea>
              <DropdownMenuSeparator />
              <Link href="/notifications">
                <DropdownMenuItem
                  className="justify-center text-pink-400 hover:text-pink-300 cursor-pointer"
                  onClick={() => setNotificationDropdownOpen(false)}
                >
                  View all notifications
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dark Mode Toggle */}
          <DarkModeToggle variant="dropdown" className="hidden sm:flex" />

          {/* Profile Menu with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 p-2 touch-target min-h-[44px] md:min-h-[36px]"
                data-testid="profile-menu"
                aria-label="Open user menu"
                aria-haspopup="menu"
              >
                <Avatar className="h-7 w-7 md:h-8 md:w-8 ring-2 ring-primary/20">
                  <AvatarImage
                    src={user?.profileImageUrl}
                    alt={user?.username || 'User profile picture'}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs" aria-label={`${user?.firstName || user?.username || 'User'} avatar`}>
                    {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-sm font-medium text-foreground truncate max-w-24">
                  {user?.firstName || user?.username}
                </span>
                <ChevronDown className="h-4 w-4 hidden lg:block text-muted-foreground" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">@{user?.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Profile & Content */}
              <DropdownMenuGroup>
                <Link href={user?.role === 'creator' ? `/creator/${user?.id}` : '/settings'}>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                </Link>
                {(user?.role === 'creator' || user?.role === 'admin') && (
                  <>
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/media">
                      <DropdownMenuItem className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>My Content</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/subscriptions">
                      <DropdownMenuItem className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Subscribers</span>
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Financial */}
              <DropdownMenuGroup>
                <Link href="/wallet">
                  <DropdownMenuItem className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Wallet</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/payments">
                  <DropdownMenuItem className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Payments</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Settings & Support */}
              <DropdownMenuGroup>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings/privacy">
                  <DropdownMenuItem className="cursor-pointer">
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Privacy</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/help">
                  <DropdownMenuItem className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Admin Link */}
              {(user?.role === 'admin' || user?.role === 'moderator' || hasAdminAccess) && (
                <>
                  <Link href="/admin/dashboard">
                    <DropdownMenuItem className="cursor-pointer text-primary">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Logout */}
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Platform Navigation Bar - shows when user has multiple platforms */}
      {/* Ad Banner Space */}
      {user && (
        <div className="w-full py-2 px-4 flex justify-center border-b border-white/5">
          <AdSpacePlaceholder size="banner" className="max-w-3xl" />
        </div>
      )}
    </header>
  );
}
