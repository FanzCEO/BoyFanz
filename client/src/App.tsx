import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GDPRConsentBanner } from "@/components/GDPRConsentBanner";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWebSocketInit } from "@/hooks/useWebSocketInit";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import SocialHome from "@/pages/SocialHome";
import Media from "@/pages/Media";
import Compliance from "@/pages/Compliance";
import Payouts from "@/pages/Payouts";
import Notifications from "@/pages/Notifications";
import Purchased from "@/pages/Purchased";
import Subscriptions from "@/pages/Subscriptions";
import ReleaseForms from "@/pages/ReleaseForms";
import Nearby from "@/pages/Nearby";
import ModerationQueue from "@/pages/Admin/ModerationQueue";
import UserManagement from "@/pages/Admin/UserManagement";
import DelegationManager from "@/pages/Admin/DelegationManager";
import ThemeManager from "@/pages/Admin/ThemeManager";
import AdminDashboard from "@/pages/Admin/Dashboard";
import ComplaintsManagement from "@/pages/Admin/Complaints";
import WithdrawalsManagement from "@/pages/Admin/Withdrawals";
import VerificationManagement from "@/pages/Admin/Verification";
import AdminReports from "@/pages/Admin/Reports";
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
import MassMessaging from "@/pages/MassMessaging";
import PostView from "@/pages/PostView";
import EarningsPage from "@/pages/Creator/EarningsPage";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import StreamCreation from "@/pages/StreamCreation";
import StreamDashboard from "@/pages/StreamDashboard";
import LiveViewer from "@/pages/LiveViewer";
import StreamAnalytics from "@/pages/StreamAnalytics";
import StreamsHome from "@/pages/StreamsHome";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  useTheme(); // Apply active theme
  useWebSocketInit(); // Initialize WebSocket connection
  
  // Prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
        console.warn('Auth loading timeout - showing app anyway');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Protected routes that require authentication
  const protectedRoutes = ['/feed', '/messages', '/mass-messaging', '/post', '/earnings', '/media', '/compliance', '/payouts', '/notifications', '/settings', '/admin', '/purchased', '/subscriptions', '/release-forms', '/nearby', '/streams'];
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => location.startsWith(route));

  // Redirect to login if trying to access protected route while unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      navigate('/auth/login');
    }
  }, [isLoading, isAuthenticated, isProtectedRoute, navigate]);

  // Show simplified loading, but don't block forever
  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading BoyFanz...</p>
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
            <Route path="/" component={SocialHome} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/media" component={Media} />
            <Route path="/compliance" component={Compliance} />
            <Route path="/payouts" component={Payouts} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/purchased" component={Purchased} />
            <Route path="/subscriptions" component={Subscriptions} />
            <Route path="/release-forms" component={ReleaseForms} />
            <Route path="/nearby" component={Nearby} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/complaints" component={ComplaintsManagement} />
            <Route path="/admin/withdrawals" component={WithdrawalsManagement} />
            <Route path="/admin/verification" component={VerificationManagement} />
            <Route path="/admin/moderation" component={ModerationQueue} />
            <Route path="/admin/moderation-queue" component={ModerationQueue} />
            <Route path="/admin/users" component={UserManagement} />
            <Route path="/admin/delegation" component={DelegationManager} />
            <Route path="/admin/themes" component={ThemeManager} />
            <Route path="/admin/reports" component={AdminReports} />
            <Route path="/settings" component={Settings} />
            <Route path="/creator/:userId" component={CreatorProfile} />
            <Route path="/feed" component={PostsFeed} />
            <Route path="/search" component={SearchCreators} />
            <Route path="/messages" component={Messages} />
            <Route path="/mass-messaging" component={MassMessaging} />
            <Route path="/post/:postId" component={PostView} />
            <Route path="/earnings" component={EarningsPage} />
            <Route path="/streams" component={StreamsHome} />
            <Route path="/streams/create" component={StreamCreation} />
            <Route path="/streams/:id/dashboard">
              {(params) => <StreamDashboard streamId={params.id} />}
            </Route>
            <Route path="/streams/:id/watch">
              {(params) => <LiveViewer streamId={params.id} />}
            </Route>
            <Route path="/streams/:id/analytics">
              {(params) => <StreamAnalytics streamId={params.id} />}
            </Route>
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
          <GDPRConsentBanner />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
