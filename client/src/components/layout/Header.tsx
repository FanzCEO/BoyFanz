import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Settings } from "lucide-react";

interface HeaderProps {
  user: any;
}

export default function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="header">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold font-display" data-testid="page-title">Dashboard</h1>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <i className="fas fa-circle text-accent text-xs"></i>
            <span data-testid="system-status">System Online</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
              data-testid="search-input"
            />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" data-testid="notifications-button">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full notification-dot"></span>
          </Button>
          
          {/* Profile Menu */}
          <Button variant="ghost" className="flex items-center gap-2 p-2" data-testid="profile-menu">
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"} 
              alt="User Avatar" 
              className="h-8 w-8 rounded-full ring-2 ring-primary/20"
              data-testid="header-user-avatar"
            />
          </Button>
        </div>
      </div>
    </header>
  );
}
