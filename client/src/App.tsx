import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Media from "@/pages/Media";
import Compliance from "@/pages/Compliance";
import Payouts from "@/pages/Payouts";
import Notifications from "@/pages/Notifications";
import ModerationQueue from "@/pages/Admin/ModerationQueue";
import UserManagement from "@/pages/Admin/UserManagement";
import DelegationManager from "@/pages/Admin/DelegationManager";
import ThemeManager from "@/pages/Admin/ThemeManager";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
// Auth pages
import StarzSignup from "@/pages/auth/StarzSignup";
import FanzSignup from "@/pages/auth/FanzSignup";
import Login from "@/pages/auth/Login";
import ResetPassword from "@/pages/auth/ResetPassword";
// Creator Economy pages
import CreatorProfile from "@/pages/CreatorProfile";
import PostsFeed from "@/pages/PostsFeed";
import SearchCreators from "@/pages/SearchCreators";
import Messages from "@/pages/Messages";
import PostView from "@/pages/PostView";
import EarningsPage from "@/pages/Creator/EarningsPage";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  useTheme(); // Apply active theme

  // Protected routes that require authentication
  const protectedRoutes = ['/feed', '/messages', '/post', '/earnings', '/media', '/compliance', '/payouts', '/notifications', '/settings', '/admin'];
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => location.startsWith(route));

  // Redirect to login if trying to access protected route while unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      navigate('/auth/login');
    }
  }, [isLoading, isAuthenticated, isProtectedRoute, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth/starz-signup" component={StarzSignup} />
        <Route path="/auth/fanz-signup" component={FanzSignup} />
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/reset-password" component={ResetPassword} />
        {/* Public pages for discovery */}
        <Route path="/creator/:userId" component={CreatorProfile} />
        <Route path="/search" component={SearchCreators} />
        <Route path="/blog" component={Blog} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />
      <div className={cn(
        "transition-all duration-300",
        "md:ml-64" // Only add left margin on desktop
      )}>
        <Header user={user} />
        <main className="p-4 md:p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/media" component={Media} />
            <Route path="/compliance" component={Compliance} />
            <Route path="/payouts" component={Payouts} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/admin/moderation" component={ModerationQueue} />
            <Route path="/admin/moderation-queue" component={ModerationQueue} />
            <Route path="/admin/users" component={UserManagement} />
            <Route path="/admin/delegation" component={DelegationManager} />
            <Route path="/admin/themes" component={ThemeManager} />
            <Route path="/settings" component={Settings} />
            <Route path="/creator/:userId" component={CreatorProfile} />
            <Route path="/feed" component={PostsFeed} />
            <Route path="/search" component={SearchCreators} />
            <Route path="/messages" component={Messages} />
            <Route path="/post/:postId" component={PostView} />
            <Route path="/earnings" component={EarningsPage} />
            <Route path="/blog" component={Blog} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
