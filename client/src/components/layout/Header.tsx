import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Search, Settings, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: any;
}

export default function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="header">
      <div className={cn(
        "flex h-14 md:h-16 items-center justify-between px-4 md:px-6",
        isMobile && "pl-16" // Add left padding on mobile to account for hamburger menu
      )}>
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <h1 className="text-lg md:text-2xl font-bold font-display truncate" data-testid="page-title">Dashboard</h1>
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <i className="fas fa-circle text-accent text-xs"></i>
            <span data-testid="system-status">System Online</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Hidden on mobile, expandable on tablet+ */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 pl-10"
              data-testid="search-input"
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
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto p-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="search"
                      placeholder="Search creators, content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 touch-target"
                      data-testid="mobile-search-input"
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
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <Button type="submit" className="w-full touch-target" disabled={!searchQuery.trim()}>
                  Search
                </Button>
              </form>
            </SheetContent>
          </Sheet>
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative touch-target" 
            data-testid="notifications-button"
          >
            <Bell className="h-4 w-4 md:h-4 md:w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full notification-dot"></span>
          </Button>
          
          {/* Profile Menu */}
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 p-2 touch-target min-h-[44px] md:min-h-[36px]" 
            data-testid="profile-menu"
          >
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"} 
              alt="User Avatar" 
              className="h-7 w-7 md:h-8 md:w-8 rounded-full ring-2 ring-primary/20"
              data-testid="header-user-avatar"
            />
            <span className="hidden lg:block text-sm font-medium text-foreground truncate max-w-24">
              {user?.firstName}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
