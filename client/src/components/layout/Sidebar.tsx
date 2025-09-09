import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: any;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  const navItems = [
    { path: "/", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { path: "/media", icon: "fas fa-photo-video", label: "Media Assets", badge: "3" },
    { path: "/compliance", icon: "fas fa-shield-alt", label: "Compliance", badge: "KYC" },
    { path: "/payouts", icon: "fas fa-dollar-sign", label: "Payouts" },
    { path: "/notifications", icon: "fas fa-bell", label: "Notifications", dot: true },
  ];

  const adminItems = [
    { path: "/admin/moderation", icon: "fas fa-tasks", label: "Moderation Queue", badge: "7" },
    { path: "/admin/users", icon: "fas fa-users", label: "User Management" },
    { path: "/settings", icon: "fas fa-chart-bar", label: "Analytics" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border" data-testid="sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center glow-effect">
              <i className="fas fa-fire text-primary-foreground text-lg"></i>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl neon-sign tracking-wider">BoyFanz</span>
              <span className="text-xs neon-sign-golden font-heading font-semibold tracking-wide uppercase">Every Man's Playground</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4" data-testid="sidebar-nav">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "sidebar-link flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                    isActive(item.path)
                      ? "active bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-4`}></i>
                  {item.label}
                  {item.badge && (
                    <span className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded-full",
                      item.badge === "KYC" 
                        ? "bg-yellow-500 text-yellow-900"
                        : "bg-primary text-primary-foreground"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {item.dot && (
                    <span className="ml-auto w-2 h-2 bg-primary rounded-full notification-dot"></span>
                  )}
                </a>
              </Link>
            ))}
          </div>

          {user?.role === 'admin' && (
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </h3>
              <div className="mt-2 space-y-1">
                {adminItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <a
                      className={cn(
                        "sidebar-link flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                        isActive(item.path)
                          ? "active bg-primary/10 text-primary border-r-2 border-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      data-testid={`admin-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <i className={`${item.icon} w-4`}></i>
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"} 
              alt="User Avatar" 
              className="h-10 w-10 rounded-full ring-2 ring-primary/20"
              data-testid="user-avatar"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="user-display-name">
                {user?.profile?.displayName || `${user?.firstName} ${user?.lastName}` || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate" data-testid="user-role">
                {user?.role || 'Creator'}
              </p>
            </div>
            <Link href="/settings">
              <a className="text-muted-foreground hover:text-foreground" data-testid="settings-button">
                <i className="fas fa-cog"></i>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
