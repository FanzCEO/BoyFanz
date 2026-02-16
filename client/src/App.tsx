// @ts-nocheck
// Full Platform App.tsx with Sidebar and Header layout - ALL ROUTES
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
import { useEffect, useState, lazy, Suspense } from "react";

// Layout components - FULL PLATFORM UI
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

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
import Notifications from "@/pages/Notifications";
import InfinityFeed from "@/pages/InfinityFeed";
import FanzMoneyCenter from "@/pages/FanzMoneyCenter";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import Subscriptions from "@/pages/Subscriptions";
import Purchased from "@/pages/Purchased";
import CustomRequests from "@/pages/CustomRequests";
import Wallet from "@/pages/Wallet";
import Referrals from "@/pages/Referrals";
import Stories from "@/pages/Stories";
import ReleaseForms from "@/pages/ReleaseForms";
import Nearby from "@/pages/Nearby";
import Outlawz from "@/pages/Outlawz";
import FanzCock from "@/pages/FanzCock";
import StarzStudio from "@/pages/StarzStudio";
import FanzCyberSecure from "@/pages/FanzCyberSecure";
// Lazy load 3D components to prevent React Three Fiber from crashing app init
const FanzNexus = lazy(() => import("@/pages/FanzNexus"));
import StarzCardzPage from "@/pages/StarzCardzPage";
import FanzSpa from "@/pages/FanzSpa";
import Payments from "@/pages/Payments";
import PaymentsReceived from "@/pages/PaymentsReceived";
import Payouts from "@/pages/Payouts";
import Withdrawals from "@/pages/Withdrawals";
import BecomeCreator from "@/pages/BecomeCreator";
import CreatorRequests from "@/pages/CreatorRequests";
import PostView from "@/pages/PostView";
import PrivacySettings from "@/pages/PrivacySettings";

// Streams & Events
import StreamsHome from "@/pages/StreamsHome";
import StreamCreation from "@/pages/StreamCreation";
import StreamDashboard from "@/pages/StreamDashboard";
import EventsHome from "@/pages/EventsHome";
import EventHost from "@/pages/EventHost";
import EventDetails from "@/pages/EventDetails";
import EventLive from "@/pages/EventLive";

// Creator pages
import CreatorAnalytics from "@/pages/Creator/Analytics";
import EarningsPage from "@/pages/Creator/EarningsPage";
import FreeLinksPage from "@/pages/Creator/FreeLinksPage";

// FanzEmpire pages
import FanzDefend from "@/pages/FanzEmpire/FanzDefend";
import FanzEmpire from "@/pages/FanzEmpire/FanzEmpire";

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

// Public pages
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import SafetyCenter from "@/pages/SafetyCenter";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import { HelpCenter } from "@/pages/HelpCenter";
import AboutUs from "@/pages/AboutUs";
import ContentPolicy from "@/pages/ContentPolicy";
import CookiesPolicy from "@/pages/CookiesPolicy";
import DMCAPolicy from "@/pages/DMCAPolicy";
import Compliance from "@/pages/Compliance";

// Admin pages
import AdminDashboard from "@/pages/Admin/Dashboard";
import UserManagement from "@/pages/Admin/UserManagement";
import ModerationQueue from "@/pages/Admin/ModerationQueue";
import AdminComplaints from "@/pages/Admin/Complaints";
import AdminWithdrawals from "@/pages/Admin/Withdrawals";
import AdminVerification from "@/pages/Admin/Verification";
import AdminDelegation from "@/pages/Admin/DelegationManager";
import AdminThemes from "@/pages/Admin/ThemeManager";
import AdminReports from "@/pages/Admin/Reports";
import AdminPosts from "@/pages/Admin/PostsManagement";
import AdminStreaming from "@/pages/Admin/LiveStreaming";
import AdminStories from "@/pages/Admin/StoriesManagement";
import AdminShop from "@/pages/Admin/ShopManagement";
import AdminCategories from "@/pages/Admin/CategoriesManagement";
import AdminForums from "@/pages/Admin/ForumsManagement";
import AdminMessages from "@/pages/Admin/MessagesManagement";
import AdminTransactions from "@/pages/Admin/TransactionsManagement";
import AdminBilling from "@/pages/Admin/BillingManagement";
import AdminTaxRates from "@/pages/Admin/TaxRatesManagement";
import AdminPaymentSettings from "@/pages/Admin/PaymentSettings";
import AdminDeposits from "@/pages/Admin/DepositsManagement";
import AdminPlatforms from "@/pages/Admin/PlatformManagement";
import AdminCloudStorage from "@/pages/Admin/CloudStorage";
import AdminAnnouncements from "@/pages/Admin/AnnouncementsManagement";
import AdminPushNotifications from "@/pages/Admin/PushNotifications";
import AdminEmail from "@/pages/Admin/EmailManagement";
import AdminSystemSettings from "@/pages/Admin/SystemSettings";
import AdminBranding from "@/pages/Admin/BrandingManagement";
import AdminBookings from "@/pages/Admin/BookingManagement";
import AdminAppearance from "@/pages/Admin/SiteAppearance";
import AdminGallery from "@/pages/Admin/GalleryManagement";
import AdminOAuth from "@/pages/Admin/OAuthSettings";
import AdminStorage from "@/pages/Admin/StorageManagement";
import AdminAuditLog from "@/pages/Admin/AuditLog";
import AdminSecurityDashboard from "@/pages/Admin/SecurityDashboard";

// Live Streaming pages
import { GoLivePage, WatchStreamPage, LiveStreamsPage, VideoCallPage } from "@/pages/live";

// Forums
import ForumsHome from "@/pages/forums/ForumsHome";
import ForumCategory from "@/pages/forums/ForumCategory";
import ForumTopic from "@/pages/forums/ForumTopic";
import CreateTopic from "@/pages/forums/CreateTopic";

// Help pages
import { WikiPage } from "@/pages/help/WikiPage";
import { TutorialsPage } from "@/pages/help/TutorialsPage";
import { TicketsPage } from "@/pages/help/TicketsPage";
import { ChatPage } from "@/pages/help/ChatPage";

console.log('[BOYFANZ] Full Platform App loading with ALL ROUTES...');

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  useTheme();
  useWebSocketInit();

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ['/feed', '/messages', '/dashboard', '/settings', '/media'];
  const isProtectedRoute = protectedRoutes.some(route => location.startsWith(route));

  useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      navigate('/auth/login');
    }
  }, [isLoading, isAuthenticated, isProtectedRoute, navigate]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src="/boyfanz-logo.png" alt="BoyFanz" className="w-24 h-auto mx-auto mb-4" />
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth routes are ALWAYS available - no timeout gating
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth-complete" component={AuthComplete} />
        <Route path="/auth-error" component={AuthError} />
        <Route path="/auth/register" component={Register} />
        <Route path="/auth/login" component={LoginNew} />
        <Route path="/auth/forgot-password" component={ForgotPassword} />
        <Route path="/auth/reset-password" component={ResetPasswordNew} />
        <Route path="/auth/verify-email" component={VerifyEmail} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/auth/sso/callback" component={AuthCallback} />
        <Route path="/login" component={LoginNew} />
        <Route path="/signin" component={LoginNew} />
        <Route path="/creator/:userId" component={CreatorProfile} />
        <Route path="/search" component={SearchCreators} />
        <Route path="/blog" component={Blog} />
        <Route path="/contact" component={Contact} />
        <Route path="/safety" component={SafetyCenter} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/help" component={HelpCenter} />
        <Route path="/about" component={AboutUs} />
        <Route path="/content-policy" component={ContentPolicy} />
        <Route path="/cookies" component={CookiesPolicy} />
        <Route path="/dmca" component={DMCAPolicy} />
        <Route path="/compliance" component={Compliance} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Authenticated users get FULL PLATFORM LAYOUT with Sidebar and Header
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Full navigation panel */}
      <Sidebar user={user} />

      {/* Main content area */}
      <div className={`flex-1 flex flex-col ${isMobile ? 'ml-0' : 'ml-64'}`}>
        {/* Header - Top navigation bar */}
        <Header user={user} />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Switch>
            {/* Root redirect */}
            <Route path="/">
              {() => {
                navigate('/dashboard');
                return null;
              }}
            </Route>

            {/* Auth routes */}
            <Route path="/auth/login" component={LoginNew} />
            <Route path="/auth/register" component={Register} />
            <Route path="/auth/callback" component={AuthCallback} />
            <Route path="/auth/sso/callback" component={AuthCallback} />

            {/* Main Navigation */}
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/feed" component={PostsFeed} />
            <Route path="/social" component={SocialHome} />
            <Route path="/messages" component={Messages} />
            <Route path="/media" component={Media} />
            <Route path="/settings" component={Settings} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/infinity-feed" component={InfinityFeed} />
            <Route path="/fanz-money-center" component={FanzMoneyCenter} />
            <Route path="/analytics" component={AnalyticsDashboard} />
            <Route path="/subscriptions" component={Subscriptions} />
            <Route path="/purchased" component={Purchased} />
            <Route path="/custom-requests" component={CustomRequests} />
            <Route path="/wallet" component={Wallet} />
            <Route path="/referrals" component={Referrals} />
            <Route path="/stories" component={Stories} />
            <Route path="/release-forms" component={ReleaseForms} />
            <Route path="/nearby" component={Nearby} />
            <Route path="/outlawz" component={Outlawz} />

            {/* Creator & Profile */}
            <Route path="/creator/:userId" component={CreatorProfile} />
            <Route path="/search" component={SearchCreators} />
            <Route path="/post/:postId" component={PostView} />
            <Route path="/become-creator" component={BecomeCreator} />
            <Route path="/creator-requests" component={CreatorRequests} />
            <Route path="/earnings" component={EarningsPage} />
            <Route path="/free-links" component={FreeLinksPage} />
            <Route path="/creator-analytics" component={CreatorAnalytics} />

            {/* FanzTube - Video Platform */}
            <Route path="/tube" component={FanzSpa} />
            <Route path="/tube/gay" component={FanzSpa} />
            <Route path="/tube/hunks" component={FanzSpa} />
            <Route path="/tube/broz" component={FanzSpa} />
            <Route path="/tube/categories" component={FanzSpa} />

            {/* FanzCock - TikTok-style Reels */}
            <Route path="/cock" component={FanzCock} />
            <Route path="/cock/trending" component={FanzCock} />
            <Route path="/cock/following" component={FanzCock} />
            <Route path="/cock/amateur" component={FanzCock} />
            <Route path="/cock/verified" component={FanzCock} />
            <Route path="/cock/categories" component={FanzCock} />

            {/* FANZ Ecosystem */}
            <Route path="/starz-studio" component={StarzStudio} />
            <Route path="/fanz-defend" component={FanzDefend} />
            <Route path="/fanz-cybersecure" component={FanzCyberSecure} />
            <Route path="/fanz-forge" component={FanzEmpire} />
            <Route path="/fanz-filiate" component={FanzEmpire} />
            <Route path="/fanz-varsity" component={FanzEmpire} />
            <Route path="/fanz-meet" component={FanzEmpire} />
            <Route path="/fanz-swipe" component={FanzEmpire} />
            <Route path="/fanz-world" component={FanzEmpire} />
            <Route path="/starz-cardz" component={StarzCardzPage} />
            <Route path="/wicked-crm" component={FanzEmpire} />
            <Route path="/fanz-empire" component={FanzEmpire} />

            {/* Security & Architecture - Lazy loaded 3D components */}
            <Route path="/fanz-nexus">
              <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading 3D...</div>}>
                <FanzNexus />
              </Suspense>
            </Route>
            <Route path="/fanz-neuroverse" component={FanzEmpire} />

            {/* Mobile Apps */}
            <Route path="/fanz-incognito" component={FanzEmpire} />
            <Route path="/fanz-cloud" component={FanzEmpire} />

            {/* Streams & Live */}
            <Route path="/streams" component={StreamsHome} />
            <Route path="/streams/create" component={StreamCreation} />
            <Route path="/streams/dashboard" component={StreamDashboard} />
            <Route path="/live" component={LiveStreamsPage} />
            <Route path="/live/go-live" component={GoLivePage} />
            <Route path="/live/watch/:roomName" component={WatchStreamPage} />
            <Route path="/video-call/:roomName" component={VideoCallPage} />
            <Route path="/video-call/start/:userId" component={VideoCallPage} />

            {/* Events */}
            <Route path="/events" component={EventsHome} />
            <Route path="/events/host" component={EventHost} />
            <Route path="/events/:eventId" component={EventDetails} />
            <Route path="/events/:eventId/live" component={EventLive} />

            {/* Forums */}
            <Route path="/forums" component={ForumsHome} />
            <Route path="/forums/category/:categoryId" component={ForumCategory} />
            <Route path="/forums/topic/:topicId" component={ForumTopic} />
            <Route path="/forums/create" component={CreateTopic} />

            {/* Privacy & Security Settings */}
            <Route path="/settings/privacy" component={PrivacySettings} />
            <Route path="/settings/password" component={Settings} />
            <Route path="/settings/countries" component={Settings} />
            <Route path="/settings/restricted" component={Settings} />

            {/* Payments */}
            <Route path="/payments" component={Payments} />
            <Route path="/payments/received" component={PaymentsReceived} />
            <Route path="/payouts" component={Payouts} />
            <Route path="/withdrawals" component={Withdrawals} />

            {/* Help & Support */}
            <Route path="/help" component={HelpCenter} />
            <Route path="/help/wiki" component={WikiPage} />
            <Route path="/help/tutorials" component={TutorialsPage} />
            <Route path="/help/tickets" component={TicketsPage} />
            <Route path="/help/chat" component={ChatPage} />
            <Route path="/blog" component={Blog} />
            <Route path="/contact" component={Contact} />

            {/* Legal & Policy */}
            <Route path="/safety" component={SafetyCenter} />
            <Route path="/terms" component={TermsOfService} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route path="/about" component={AboutUs} />
            <Route path="/content-policy" component={ContentPolicy} />
            <Route path="/cookies" component={CookiesPolicy} />
            <Route path="/dmca" component={DMCAPolicy} />
            <Route path="/compliance" component={Compliance} />

            {/* Admin - Core */}
            <Route path="/panel/admin/dashboard" component={AdminDashboard} />
            <Route path="/panel/admin/users" component={UserManagement} />
            <Route path="/panel/admin/moderation" component={ModerationQueue} />
            <Route path="/panel/admin/complaints" component={AdminComplaints} />
            <Route path="/panel/admin/withdrawals" component={AdminWithdrawals} />
            <Route path="/panel/admin/verification" component={AdminVerification} />
            <Route path="/panel/admin/delegation" component={AdminDelegation} />
            <Route path="/panel/admin/themes" component={AdminThemes} />
            <Route path="/panel/admin/reports" component={AdminReports} />
            <Route path="/panel/admin/audit-log" component={AdminAuditLog} />
            <Route path="/panel/admin/security" component={AdminSecurityDashboard} />

            {/* Admin - Content Management */}
            <Route path="/panel/admin/posts" component={AdminPosts} />
            <Route path="/panel/admin/streaming" component={AdminStreaming} />
            <Route path="/panel/admin/stories" component={AdminStories} />
            <Route path="/panel/admin/shop" component={AdminShop} />
            <Route path="/panel/admin/categories" component={AdminCategories} />
            <Route path="/panel/admin/forums" component={AdminForums} />
            <Route path="/panel/admin/messages" component={AdminMessages} />

            {/* Admin - Financial Management */}
            <Route path="/panel/admin/transactions" component={AdminTransactions} />
            <Route path="/panel/admin/billing" component={AdminBilling} />
            <Route path="/panel/admin/tax-rates" component={AdminTaxRates} />
            <Route path="/panel/admin/payment-settings" component={AdminPaymentSettings} />
            <Route path="/panel/admin/deposits" component={AdminDeposits} />

            {/* Admin - System Management */}
            <Route path="/panel/admin/platforms" component={AdminPlatforms} />
            <Route path="/panel/admin/cloud-storage" component={AdminCloudStorage} />
            <Route path="/panel/admin/announcements" component={AdminAnnouncements} />
            <Route path="/panel/admin/push-notifications" component={AdminPushNotifications} />
            <Route path="/panel/admin/email-marketing" component={AdminEmail} />
            <Route path="/panel/admin/system-settings" component={AdminSystemSettings} />
            <Route path="/panel/admin/branding" component={AdminBranding} />
            <Route path="/panel/admin/bookings" component={AdminBookings} />
            <Route path="/panel/admin/appearance" component={AdminAppearance} />
            <Route path="/panel/admin/gallery" component={AdminGallery} />
            <Route path="/panel/admin/oauth-settings" component={AdminOAuth} />
            <Route path="/panel/admin/storage" component={AdminStorage} />

            {/* 404 fallback */}
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
