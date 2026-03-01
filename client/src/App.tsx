// @ts-nocheck
// Stable App.tsx - working version with essential features
import { ScreenshotProtectionProvider } from '@/components/security/ScreenshotProtection';
import { PlatformProvider } from '@/contexts/PlatformContext';
import screenshotProtectionConfig from './config/screenshot-protection';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWebSocketInit } from "@/hooks/useWebSocketInit";
import { useEffect, useState } from "react";

// Core pages
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import SocialHome from "@/pages/SocialHome";
import Media from "@/pages/Media";
import Settings from "@/pages/Settings";
import Messages from "@/pages/Messages";
import CreatorProfile from "@/pages/CreatorProfile";
import PostsFeed from "@/pages/PostsFeed";
import SearchCreators from "@/pages/SearchCreators";

// Auth pages
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import AuthComplete from '@/pages/AuthComplete';
import AuthError from '@/pages/AuthError';
import Register from "@/pages/auth/Register";
import LoginNew from "@/pages/auth/LoginNew";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPasswordNew from "@/pages/auth/ResetPasswordNew";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import CreatorSignup from "@/pages/CreatorSignup";

// Public pages
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import SafetyCenter from "@/pages/SafetyCenter";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import { HelpCenter } from "@/pages/HelpCenter";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import UserManagement from "@/pages/admin/UserManagement";
import ModerationQueue from "@/pages/admin/ModerationQueue";

// Main sidebar pages
import InfinityFeed from "@/pages/InfinityFeed";
import FanzMoneyCenter from "@/pages/FanzMoneyCenter";
import StarzStudio from "@/pages/StarzStudio";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import Notifications from "@/pages/Notifications";
import Subscriptions from "@/pages/Subscriptions";
import Purchased from "@/pages/Purchased";
import CustomRequests from "@/pages/CustomRequests";
import Wallet from "@/pages/Wallet";
import Referrals from "@/pages/Referrals";
import Stories from "@/pages/Stories";
import ReleaseForms from "@/pages/ReleaseForms";
import Nearby from "@/pages/Nearby";
import Outlawz from "@/pages/Outlawz";
import FanzSpa from "@/pages/FanzSpa";

// Creator pages
import BecomeCreator from "@/pages/BecomeCreator";
import CreatorRequests from "@/pages/CreatorRequests";
import Collaborations from "@/pages/Collaborations";
import MassMessaging from "@/pages/MassMessaging";
import FreeLinkRedeem from "@/pages/FreeLinkRedeem";

// Financial pages
import Payments from "@/pages/Payments";
import PaymentsReceived from "@/pages/PaymentsReceived";
import Payouts from "@/pages/Payouts";
import Withdrawals from "@/pages/Withdrawals";

// Ecosystem pages
import FanzCock from "@/pages/FanzCock";
import FanzCyberSecure from "@/pages/FanzCyberSecure";
import FanzNexus from "@/pages/FanzNexus";
import StarzCardzPage from "@/pages/StarzCardzPage";
import Bathhouse from "@/pages/Bathhouse";
import NaughtyProfile from "@/pages/NaughtyProfile";

// Live/Events pages
import EventsHome from "@/pages/EventsHome";
import EventDetails from "@/pages/EventDetails";
import EventHost from "@/pages/EventHost";
import EventLive from "@/pages/EventLive";
import StreamsHome from "@/pages/StreamsHome";
import StreamCreation from "@/pages/StreamCreation";
import StreamAnalytics from "@/pages/StreamAnalytics";

// Content pages
import SavedPosts from "@/pages/SavedPosts";
import PostView from "@/pages/PostView";

// Forums
import ForumsHome from "@/pages/forums/ForumsHome";

// Settings sub-pages
import SettingsPrivacy from "@/pages/settings/Privacy";
import SettingsPassword from "@/pages/settings/Password";
import SettingsCountries from "@/pages/settings/Countries";
import SettingsRestricted from "@/pages/settings/Restricted";

// Help sub-pages
import { WikiPage } from "@/pages/help/WikiPage";
import { TutorialsPage } from "@/pages/help/TutorialsPage";
import { TicketsPage } from "@/pages/help/TicketsPage";
import { ChatPage } from "@/pages/help/ChatPage";

console.log('[BOYFANZ] Stable App loading...');

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  useTheme();
  useWebSocketInit();

  // Redirect from protected routes if not authenticated
  const protectedRoutes = ['/feed', '/messages', '/dashboard', '/settings', '/media', '/panel/admin', '/infinity-feed', '/fanz-money-center', '/starz-studio', '/analytics', '/notifications', '/subscriptions', '/purchased', '/wallet', '/custom-requests', '/referrals', '/stories', '/nearby', '/payments', '/payouts', '/withdrawals'];
  const isProtectedRoute = protectedRoutes.some(route => location.startsWith(route));

  useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      navigate('/auth/login');
    }
  }, [isLoading, isAuthenticated, isProtectedRoute, navigate]);

  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/auth/login" component={LoginNew} />
      <Route path="/auth/register" component={Register} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/reset-password" component={ResetPasswordNew} />
      <Route path="/auth/verify-email" component={VerifyEmail} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/auth-complete" component={AuthComplete} />
      <Route path="/auth-error" component={AuthError} />
      <Route path="/login" component={Login} />
      <Route path="/signin" component={Login} />
      <Route path="/creator-signup" component={CreatorSignup} />

      {/* Main navigation */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/infinity-feed" component={InfinityFeed} />
      <Route path="/fanzspa" component={FanzSpa} />
      <Route path="/fanz-money-center" component={FanzMoneyCenter} />
      <Route path="/fanzmoneycenteer" component={FanzMoneyCenter} />
      <Route path="/starz-studio" component={StarzStudio} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/feed" component={PostsFeed} />
      <Route path="/social" component={SocialHome} />
      <Route path="/messages" component={Messages} />
      <Route path="/media" component={Media} />
      <Route path="/search" component={SearchCreators} />
      <Route path="/subscriptions" component={Subscriptions} />
      <Route path="/purchased" component={Purchased} />
      <Route path="/custom-requests" component={CustomRequests} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/stories" component={Stories} />
      <Route path="/release-forms" component={ReleaseForms} />
      <Route path="/nearby" component={Nearby} />
      <Route path="/outlawz" component={Outlawz} />
      <Route path="/saved" component={SavedPosts} />
      <Route path="/post/:postId" component={PostView} />

      {/* Creator routes */}
      <Route path="/creator/:userId" component={CreatorProfile} />
      <Route path="/become-creator" component={BecomeCreator} />
      <Route path="/creator-requests" component={CreatorRequests} />
      <Route path="/collaborations" component={Collaborations} />
      <Route path="/mass-messaging" component={MassMessaging} />
      <Route path="/free-links" component={FreeLinkRedeem} />
      <Route path="/naughty-profile" component={NaughtyProfile} />

      {/* Financial routes */}
      <Route path="/payments" component={Payments} />
      <Route path="/payments/received" component={PaymentsReceived} />
      <Route path="/payouts" component={Payouts} />
      <Route path="/withdrawals" component={Withdrawals} />
      <Route path="/earnings" component={AnalyticsDashboard} />

      {/* Live / Events / Streams */}
      <Route path="/events" component={EventsHome} />
      <Route path="/events/:eventId" component={EventDetails} />
      <Route path="/events/host" component={EventHost} />
      <Route path="/events/live/:eventId" component={EventLive} />
      <Route path="/live-events" component={EventsHome} />
      <Route path="/streams" component={StreamsHome} />
      <Route path="/streams/create" component={StreamCreation} />
      <Route path="/streams/analytics" component={StreamAnalytics} />

      {/* Ecosystem */}
      <Route path="/cock" component={FanzCock} />
      <Route path="/cock/:section" component={FanzCock} />
      <Route path="/fanz-cybersecure" component={FanzCyberSecure} />
      <Route path="/fanz-nexus" component={FanzNexus} />
      <Route path="/starz-cardz" component={StarzCardzPage} />
      <Route path="/bathhouse" component={Bathhouse} />
      <Route path="/forums" component={ForumsHome} />

      {/* Settings sub-pages */}
      <Route path="/settings/privacy" component={SettingsPrivacy} />
      <Route path="/settings/password" component={SettingsPassword} />
      <Route path="/settings/countries" component={SettingsCountries} />
      <Route path="/settings/restricted" component={SettingsRestricted} />
      <Route path="/settings" component={Settings} />

      {/* Help sub-pages */}
      <Route path="/help/wiki" component={WikiPage} />
      <Route path="/help/tutorials" component={TutorialsPage} />
      <Route path="/help/tickets" component={TicketsPage} />
      <Route path="/help/chat" component={ChatPage} />
      <Route path="/help" component={HelpCenter} />

      {/* Public pages */}
      <Route path="/blog" component={Blog} />
      <Route path="/contact" component={Contact} />
      <Route path="/safety" component={SafetyCenter} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />

      {/* Admin */}
      <Route path="/panel/admin/dashboard" component={AdminDashboard} />
      <Route path="/panel/admin/users" component={UserManagement} />
      <Route path="/panel/admin/moderation" component={ModerationQueue} />

      {/* Landing + catch-all */}
      <Route path="/" component={Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ScreenshotProtectionProvider config={screenshotProtectionConfig}>
          <PlatformProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </PlatformProvider>
        </ScreenshotProtectionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
