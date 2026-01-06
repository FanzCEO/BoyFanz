// @ts-nocheck
import { useCommonShortcuts } from '@/components/accessibility/KeyboardNavigation';
import { ScreenshotProtectionProvider } from '@/components/security/ScreenshotProtection';
import screenshotProtectionConfig from './config/screenshot-protection';
import { StickyFooterAd } from '@/components/ads/AdBanner';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GDPRConsentBanner } from "@/components/GDPRConsentBanner";
import AIChatBot from "@/components/AIChatBot";
import { FloatingSupportWidget } from "@/components/help/FloatingSupportWidget";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWebSocketInit } from "@/hooks/useWebSocketInit";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { pwaManager } from "@/lib/pwa";
import { offlineStorage } from "@/lib/offlineStorage";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";
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
import ForumsManagement from "@/pages/Admin/ForumsManagement";
import ComplaintsManagement from "@/pages/Admin/Complaints";
import WithdrawalsManagement from "@/pages/Admin/Withdrawals";
import VerificationManagement from "@/pages/Admin/Verification";
import AdminReports from "@/pages/Admin/Reports";
// Content Management Admin Pages
import PostsManagement from "@/pages/Admin/PostsManagement";
import LiveStreaming from "@/pages/Admin/LiveStreaming";
import StoriesManagement from "@/pages/Admin/StoriesManagement";
import ShopManagement from "@/pages/Admin/ShopManagement";
import CategoriesManagement from "@/pages/Admin/CategoriesManagement";
// Financial Management Admin Pages
import TransactionsManagement from "@/pages/Admin/TransactionsManagement";
import BillingManagement from "@/pages/Admin/BillingManagement";
import TaxRatesManagement from "@/pages/Admin/TaxRatesManagement";
import PaymentSettings from "@/pages/Admin/PaymentSettings";
import DepositsManagement from "@/pages/Admin/DepositsManagement";
import OAuthSettings from "@/pages/Admin/OAuthSettings";
// Additional Admin Pages
import AnnouncementsManagement from "@/pages/Admin/AnnouncementsManagement";
import CommentsManagement from "@/pages/Admin/CommentsManagement";
import MessagesManagement from "@/pages/Admin/MessagesManagement";
import PushNotifications from "@/pages/Admin/PushNotifications";
import StorageManagement from "@/pages/Admin/StorageManagement";
import SystemSettings from "@/pages/Admin/SystemSettings";
import EmailManagement from "@/pages/Admin/EmailManagement";
import PlatformManagement from "@/pages/Admin/PlatformManagement";
import CloudStorage from "@/pages/Admin/CloudStorage";
import DataPrivacy from "@/pages/Admin/DataPrivacy";
import BrandingManagement from "@/pages/Admin/BrandingManagement";
import BookingManagement from "@/pages/Admin/BookingManagement";
import SiteAppearance from "@/pages/Admin/SiteAppearance";
import GalleryManagement from "@/pages/Admin/GalleryManagement";
import AgentsManagement from "@/pages/admin/Agents";
// Section 7: Admin Panel & Analytics
import FraudDetection from "@/pages/Admin/FraudDetection";
import CreatorHealthScores from "@/pages/Admin/CreatorHealth";
import SupportTicketsAdmin from "@/pages/Admin/SupportTickets";
import Experiments from "@/pages/Admin/Experiments";
import AuditLog from "@/pages/Admin/AuditLog";
import CreatorAnalytics from "@/pages/Creator/Analytics";
// CoStar Verification (Public)
import CoStarVerify from "@/pages/CoStarVerify";
import Settings from "@/pages/Settings";
import PrivacySettings from "@/pages/PrivacySettings";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
// Auth pages (Email/Password)
import Register from "@/pages/auth/Register";
import LoginNew from "@/pages/auth/LoginNew";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPasswordNew from "@/pages/auth/ResetPasswordNew";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ResendVerification from "@/pages/auth/ResendVerification";
// Legacy auth pages (to be removed)
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
import InfinityFeed from "@/pages/InfinityFeed";
import CreatorProDashboard from "@/pages/CreatorProDashboard";
import FanzMoneyCenter from "@/pages/FanzMoneyCenter";
import RevenueQuests from "@/pages/RevenueQuests";
import TrustDashboard from "@/pages/TrustDashboard";
import StarzStudio from "@/pages/StarzStudio";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import SafetyCenter from "@/pages/SafetyCenter";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import WittleBearFoundation from "@/pages/WittleBearFoundation";
// Outlawz & Naughty Social pages
import Outlawz from "@/pages/Outlawz";
import NaughtyProfile from "@/pages/NaughtyProfile";
import FuckBuddies from "@/pages/FuckBuddies";
// Forum pages
import ForumsHome from "@/pages/forums/ForumsHome";
import ForumCategory from "@/pages/forums/ForumCategory";
import ForumTopic from "@/pages/forums/ForumTopic";
import CreateTopic from "@/pages/forums/CreateTopic";
// New pages for sidebar navigation
import Wallet from "@/pages/Wallet";
import Referrals from "@/pages/Referrals";
import Stories from "@/pages/Stories";
import Withdrawals from "@/pages/Withdrawals";
import Payments from "@/pages/Payments";
import PaymentsReceived from "@/pages/PaymentsReceived";
// Settings sub-pages
import PrivacySettings from "@/pages/settings/Privacy";
import PasswordSettings from "@/pages/settings/Password";
import CountriesSettings from "@/pages/settings/Countries";
import RestrictedSettings from "@/pages/settings/Restricted";
import { HelpCenter } from "@/pages/HelpCenter";
import { WikiPage } from "@/pages/help/WikiPage";
import { WikiArticlePage } from "@/pages/help/WikiArticlePage";
import { FAQPage } from "@/pages/help/FAQPage";
import { SearchResultsPage } from "@/pages/help/SearchResultsPage";
import { TutorialsPage } from "@/pages/help/TutorialsPage";
import { CreatorOnboarding } from "@/components/tutorials/CreatorOnboarding";
import { TicketsPage } from "@/pages/help/TicketsPage";
import { ChatPage } from "@/pages/help/ChatPage";
import { TicketCreationPage } from "@/pages/help/TicketCreationPage";
import TicketDetailPage from "@/pages/help/TicketDetailPage";
import StreamCreation from "@/pages/StreamCreation";
import StreamDashboard from "@/pages/StreamDashboard";
import LiveViewer from "@/pages/LiveViewer";
import StreamAnalytics from "@/pages/StreamAnalytics";
import StreamsHome from "@/pages/StreamsHome";
import EventsHome from "@/pages/EventsHome";
import EventDetails from "@/pages/EventDetails";
import EventHost from "@/pages/EventHost";
import EventLive from "@/pages/EventLive";
import CreatorSignup from "@/pages/CreatorSignup";
import FanSignup from "@/pages/FanSignup";
import BecomeCreator from "@/pages/BecomeCreator";
// FanzFiliate Ad Network
import AdvertiserDashboard from "@/pages/FanzFiliate/AdvertiserDashboard";
import PublisherDashboard from "@/pages/FanzFiliate/PublisherDashboard";
// Custom Content Requests with Escrow
import CustomRequests from "@/pages/CustomRequests";
import CreatorRequests from "@/pages/CreatorRequests";
import CreateCustomRequest from "@/pages/CreateCustomRequest";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import TutorialBot from "@/components/TutorialBot/TutorialBot";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  useTheme(); // Apply active theme
  useWebSocketInit(); // Initialize WebSocket connection
  
  // PWA Initialization
  useEffect(() => {
    // Initialize PWA features when app loads
    pwaManager.init().catch(error => {
      console.error('❌ PWA initialization failed:', error);
    });
    
    // Initialize offline storage
    offlineStorage.initDB().catch(error => {
      console.error('❌ Offline storage initialization failed:', error);
    });
    
    // Setup network status handling
    const handleOnline = () => {
      console.log('🌐 BoyFanz: Back online');
      document.body.classList.remove('offline');
      
      // Trigger sync of queued actions
      offlineStorage.getPendingActions().then(actions => {
        console.log(`🔄 BoyFanz: ${actions.length} actions to sync`);
        // The service worker will handle the actual syncing
      });
    };
    
    const handleOffline = () => {
      console.log('📵 BoyFanz: Gone offline');
      document.body.classList.add('offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial state
    if (!navigator.onLine) {
      document.body.classList.add('offline');
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
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
  const protectedRoutes = ['/feed', '/infinity-feed', '/messages', '/mass-messaging', '/post', '/earnings', '/media', '/compliance', '/payouts', '/notifications', '/settings', '/admin', '/purchased', '/subscriptions', '/release-forms', '/nearby', '/streams', '/revenue-quests', '/trust', '/fanz-money-center', '/wallet', '/referrals', '/stories', '/withdrawals', '/payments', '/events', '/custom-requests', '/creator-requests'];
  
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
        {/* Email/Password Authentication */}
        <Route path="/auth/register" component={Register} />
        <Route path="/auth/login" component={LoginNew} />
        <Route path="/auth/forgot-password" component={ForgotPassword} />
        <Route path="/auth/reset-password" component={ResetPasswordNew} />
        <Route path="/auth/verify-email" component={VerifyEmail} />
        <Route path="/auth/resend-verification" component={ResendVerification} />
        {/* Legacy routes (deprecated) */}
        <Route path="/auth/starz-signup" component={StarzSignup} />
        <Route path="/auth/fanz-signup" component={FanzSignup} />
        <Route path="/auth/login-old" component={Login} />
        <Route path="/auth/reset-password-old" component={ResetPassword} />
        {/* Public pages for discovery */}
        <Route path="/creator/:userId" component={CreatorProfile} />
        <Route path="/search" component={SearchCreators} />
        <Route path="/blog" component={Blog} />
        <Route path="/contact" component={Contact} />
        <Route path="/safety" component={SafetyCenter} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/wittle-bear-foundation" component={WittleBearFoundation} />
        {/* Outlawz & Naughty Social Routes */}
        <Route path="/outlawz" component={Outlawz} />
        <Route path="/profile/:userId" component={NaughtyProfile} />
            <Route path="/fuck-buddies" component={FuckBuddies} />
        {/* Help Center Routes (public access) */}
        <Route path="/help" component={HelpCenter} />
        <Route path="/help/faq" component={FAQPage} />
        <Route path="/help/search" component={SearchResultsPage} />
        <Route path="/help/wiki" component={WikiPage} />
        <Route path="/help/wiki/:slug">
          {(params) => <WikiArticlePage slug={params.slug} />}
        </Route>
        <Route path="/help/articles/:slug">
          {(params) => <WikiArticlePage slug={params.slug} />}
        </Route>
        <Route path="/help/contact" component={TicketCreationPage} />
        <Route path="/help/chat" component={ChatPage} />
        <Route path="/help/tutorials" component={TutorialsPage} />
        <Route path="/help/tickets" component={TicketsPage} />
        <Route path="/help/tickets/create" component={TicketCreationPage} />
        <Route path="/help/tickets/:id">
          {(params) => <TicketDetailPage />}
        </Route>
        {/* Community Forums (public viewing) */}
        <Route path="/forums" component={ForumsHome} />
        <Route path="/forums/category/:slug" component={ForumCategory} />
        <Route path="/forums/topic/:id" component={ForumTopic} />
        {/* Become Creator for existing fans */}
        <Route path="/become-creator" component={BecomeCreator} />
        {/* Signup Routes with 2257 Compliance */}
        <Route path="/creator-signup" component={CreatorSignup} />
        <Route path="/fan-signup" component={FanSignup} />
        <Route path="/signup" component={FanSignup} />
        {/* CoStar Verification - Public Route */}
        <Route path="/costar/verify/:token" component={CoStarVerify} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen homepage-bg">
      {/* PWA Components */}
      <PWAInstallPrompt />
      <OfflineIndicator />
      
      <Sidebar user={user} />
      <div className={cn(
        "transition-all duration-300",
        "md:ml-64" // Only add left margin on desktop
      )}>
        <Header user={user} />
        <main className="p-4 md:p-6 bg-transparent pb-mobile-nav">
          <Switch>
            <Route path="/" component={SocialHome} />
            <Route path="/social" component={SocialHome} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/starz-studio" component={StarzStudio} />
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
            <Route path="/admin/forums" component={ForumsManagement} />
            <Route path="/admin/moderation-queue" component={ModerationQueue} />
            <Route path="/admin/users" component={UserManagement} />
            <Route path="/admin/delegation" component={DelegationManager} />
            <Route path="/admin/themes" component={ThemeManager} />
            <Route path="/admin/reports" component={AdminReports} />
            {/* Content Management Admin Routes */}
            <Route path="/admin/posts" component={PostsManagement} />
            <Route path="/admin/streaming" component={LiveStreaming} />
            <Route path="/admin/stories" component={StoriesManagement} />
            <Route path="/admin/shop" component={ShopManagement} />
            <Route path="/admin/categories" component={CategoriesManagement} />
            {/* Financial Management Admin Routes */}
            <Route path="/admin/transactions" component={TransactionsManagement} />
            <Route path="/admin/billing" component={BillingManagement} />
            <Route path="/admin/tax-rates" component={TaxRatesManagement} />
            <Route path="/admin/payment-settings" component={PaymentSettings} />
            <Route path="/admin/deposits" component={DepositsManagement} />
            {/* Security Settings Admin Routes */}
            <Route path="/admin/oauth-settings" component={OAuthSettings} />
            {/* Additional Admin Routes */}
            <Route path="/admin/announcements" component={AnnouncementsManagement} />
            <Route path="/admin/comments" component={CommentsManagement} />
            <Route path="/admin/messages" component={MessagesManagement} />
            <Route path="/admin/push-notifications" component={PushNotifications} />
            <Route path="/admin/storage" component={StorageManagement} />
            <Route path="/admin/system-settings" component={SystemSettings} />
            <Route path="/admin/email-marketing" component={EmailManagement} />
            <Route path="/admin/platforms" component={PlatformManagement} />
            <Route path="/admin/cloud-storage" component={CloudStorage} />
            <Route path="/admin/data-privacy" component={DataPrivacy} />
            <Route path="/admin/agents" component={AgentsManagement} />
            {/* Section 7: Admin Panel & Analytics */}
            <Route path="/admin/fraud-detection" component={FraudDetection} />
            <Route path="/admin/creator-health" component={CreatorHealthScores} />
            <Route path="/admin/support-tickets" component={SupportTicketsAdmin} />
            <Route path="/admin/experiments" component={Experiments} />
            <Route path="/admin/audit-log" component={AuditLog} />
            <Route path="/creator/analytics" component={CreatorAnalytics} />
            <Route path="/admin/branding" component={BrandingManagement} />
            <Route path="/admin/bookings" component={BookingManagement} />
            <Route path="/admin/appearance" component={SiteAppearance} />
            <Route path="/admin/gallery" component={GalleryManagement} />
            <Route path="/settings" component={Settings} />
            <Route path="/settings/privacy" component={PrivacySettings} />
            {/* New sidebar navigation routes */}
            <Route path="/wallet" component={Wallet} />
            <Route path="/referrals" component={Referrals} />
            <Route path="/stories" component={Stories} />
            <Route path="/withdrawals" component={Withdrawals} />
            <Route path="/payments" component={Payments} />
            <Route path="/payments/received" component={PaymentsReceived} />
            {/* Settings sub-pages */}
            <Route path="/settings/privacy" component={PrivacySettings} />
            <Route path="/settings/password" component={PasswordSettings} />
            <Route path="/settings/countries" component={CountriesSettings} />
            <Route path="/settings/restricted" component={RestrictedSettings} />
            <Route path="/creator/:userId" component={CreatorProfile} />
            <Route path="/profile/:userId" component={NaughtyProfile} />
            <Route path="/fuck-buddies" component={FuckBuddies} />
            <Route path="/outlawz" component={Outlawz} />
            <Route path="/feed" component={PostsFeed} />
            <Route path="/infinity-feed" component={InfinityFeed} />
            <Route path="/fanz-money-center" component={FanzMoneyCenter} />
            <Route path="/revenue-quests" component={RevenueQuests} />
            <Route path="/trust" component={TrustDashboard} />
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
            {/* Mixed-Reality Live Events Routes */}
            <Route path="/events" component={EventsHome} />
            <Route path="/events/host" component={EventHost} />
            <Route path="/events/:eventId" component={EventDetails} />
            <Route path="/events/:eventId/live" component={EventLive} />
            {/* Help Center Routes */}
            <Route path="/help" component={HelpCenter} />
            <Route path="/help/faq" component={FAQPage} />
            <Route path="/help/search" component={SearchResultsPage} />
            <Route path="/help/wiki" component={WikiPage} />
            <Route path="/help/wiki/:slug">
              {(params) => <WikiArticlePage slug={params.slug} />}
            </Route>
            <Route path="/help/articles/:slug">
              {(params) => <WikiArticlePage slug={params.slug} />}
            </Route>
            <Route path="/help/contact" component={TicketCreationPage} />
            <Route path="/help/tutorials" component={TutorialsPage} />
            <Route path="/creator/training" component={CreatorOnboarding} />
            <Route path="/creator-pro" component={CreatorProDashboard} />
            <Route path="/help/tickets/new" component={TicketCreationPage} />
            <Route path="/help/tickets/create" component={TicketCreationPage} />
            <Route path="/help/tickets/:ticketId">
              {(params) => <TicketDetailPage ticketId={params.ticketId} />}
            </Route>
            <Route path="/help/tickets" component={TicketsPage} />
            <Route path="/help/chat" component={ChatPage} />
            {/* FanzFiliate Ad Network */}
            <Route path="/ads" component={AdvertiserDashboard} />
            <Route path="/ads/advertiser" component={AdvertiserDashboard} />
            <Route path="/ads/publisher" component={PublisherDashboard} />
            <Route path="/promote" component={AdvertiserDashboard} />
            <Route path="/billing" component={FanzMoneyCenter} />
            <Route path="/explore" component={SearchCreators} />
            <Route path="/shop" component={SearchCreators} />
            {/* Custom Content Requests with Escrow */}
            <Route path="/custom-requests" component={CustomRequests} />
            <Route path="/creator-requests" component={CreatorRequests} />
            <Route path="/custom-requests/new/:creatorId" component={CreateCustomRequest} />
            {/* Analytics Dashboard */}
            <Route path="/analytics" component={AnalyticsDashboard} />
            {/* Community Forums - authenticated access */}
            <Route path="/forums" component={ForumsHome} />
            <Route path="/forums/category/:slug" component={ForumCategory} />
            <Route path="/forums/topic/:id" component={ForumTopic} />
            <Route path="/forums/create" component={CreateTopic} />
            {/* Public pages accessible when logged in */}
            <Route path="/contact" component={Contact} />
            <Route path="/blog" component={Blog} />
            <Route path="/safety" component={SafetyCenter} />
            <Route path="/terms" component={TermsOfService} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route path="/wittle-bear-foundation" component={WittleBearFoundation} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>

      {/* Sticky Footer Ad - Premium, Non-intrusive */}
      <StickyFooterAd />

      {/* Tutorial Bot - Guides users through the platform */}
      <TutorialBot />

      {/* Mobile Bottom Navigation - iOS/Android style tab bar */}
      <MobileBottomNav />
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
          <FloatingSupportWidget />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
