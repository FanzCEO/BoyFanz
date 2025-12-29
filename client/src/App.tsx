import { useCommonShortcuts } from '@/components/accessibility/KeyboardNavigation';
import { ScreenshotProtectionProvider } from '@/components/security/ScreenshotProtection';
import screenshotProtectionConfig from './config/screenshot-protection';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GDPRConsentBanner } from "@/components/GDPRConsentBanner";
import AIChatBot from "@/components/AIChatBot";
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
// Agent Management Admin Page
import AgentsPage from "@/pages/Admin/Agents";
// Tip Games & Gamification Admin Pages
import TipGamesManagement from "@/pages/Admin/TipGamesManagement";
import VIPTiersManagement from "@/pages/Admin/VIPTiersManagement";
import GamificationManagement from "@/pages/Admin/GamificationManagement";
// Reels & Short Video Admin Pages
import ReelsManagement from "@/pages/Admin/ReelsManagement";
// Creator Battles Admin Pages
import BattlesManagement from "@/pages/Admin/BattlesManagement";
// AI Clone Chatbot Admin Pages
import AICloneManagement from "@/pages/Admin/AICloneManagement";
// Auctions & Tip Goals Admin Pages
import AuctionsManagement from "@/pages/Admin/AuctionsManagement";
// Watch Parties & Collabs Admin Pages
import WatchPartiesManagement from "@/pages/Admin/WatchPartiesManagement";
// Safety Center Admin Pages
import SafetyCenter from "@/pages/Admin/SafetyCenter";
// Platform Management Admin Pages
import BrandingManagement from "@/pages/Admin/BrandingManagement";
import BookingManagement from "@/pages/Admin/BookingManagement";
import SiteAppearance from "@/pages/Admin/SiteAppearance";
import ThemeEditor from "@/pages/Admin/ThemeEditor";
import GalleryManagement from "@/pages/Admin/GalleryManagement";
import Settings from "@/pages/Settings";
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
import NaughtyProfile from "@/pages/NaughtyProfile";
import CreatorStudio from "@/pages/CreatorStudio";
import Collaborations from "@/pages/Collaborations";
import PostsFeed from "@/pages/PostsFeed";
import FanzFeed from "@/pages/FanzFeed";
import SearchCreators from "@/pages/SearchCreators";
import Messages from "@/pages/Messages";
import MassMessaging from "@/pages/MassMessaging";
import PostView from "@/pages/PostView";
import EarningsPage from "@/pages/Creator/EarningsPage";
import InfinityFeed from "@/pages/InfinityFeed";
import FanzMoneyCenter from "@/pages/FanzMoneyCenter";
import RevenueQuests from "@/pages/RevenueQuests";
import TrustDashboard from "@/pages/TrustDashboard";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import { HelpCenter } from "@/pages/HelpCenter";
import { WikiPage } from "@/pages/help/WikiPage";
import { TutorialsPage } from "@/pages/help/TutorialsPage";
import { TicketsPage } from "@/pages/help/TicketsPage";
import { ChatPage } from "@/pages/help/ChatPage";
import { TicketCreationPage } from "@/pages/help/TicketCreationPage";
import TicketDetailPage from "@/pages/help/TicketDetailPage";
// Legal Pages
import { LegalLibrary } from "@/pages/legal/LegalLibrary";
import { Terms } from "@/pages/legal/Terms";
import { Privacy } from "@/pages/legal/Privacy";
import { DMCA } from "@/pages/legal/DMCA";
import { Compliance2257 } from "@/pages/legal/Compliance2257";
import { ContentGuidelines } from "@/pages/legal/ContentGuidelines";
import StreamCreation from "@/pages/StreamCreation";
import StreamDashboard from "@/pages/StreamDashboard";
import LiveViewer from "@/pages/LiveViewer";
import StreamAnalytics from "@/pages/StreamAnalytics";
import StreamsHome from "@/pages/StreamsHome";
import EventsHome from "@/pages/EventsHome";
import EventDetails from "@/pages/EventDetails";
import EventHost from "@/pages/EventHost";
import EventLive from "@/pages/EventLive";
// Special Tabs
import GayTab from "@/pages/GayTab";
import OutlawzTab from "@/pages/OutlawzTab";

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
  const protectedRoutes = ['/feed', '/fanz-feed', '/infinity-feed', '/messages', '/mass-messaging', '/post', '/earnings', '/media', '/compliance', '/payouts', '/notifications', '/settings', '/admin', '/purchased', '/subscriptions', '/release-forms', '/nearby', '/streams', '/revenue-quests', '/trust', '/fanz-money-center', '/gay', '/outlawz'];
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => location.startsWith(route));

  // Redirect to SSO login if trying to access protected route while unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      // Full page redirect to SSO login
      window.location.href = '/auth/sso/login';
    }
  }, [isLoading, isAuthenticated, isProtectedRoute]);

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
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* PWA Components */}
      <PWAInstallPrompt />
      <OfflineIndicator />
      
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
            <Route path="/admin/agents" component={AgentsPage} />
            {/* Tip Games & Gamification Admin Routes */}
            <Route path="/admin/tip-games" component={TipGamesManagement} />
            <Route path="/admin/vip-tiers" component={VIPTiersManagement} />
            <Route path="/admin/gamification" component={GamificationManagement} />
            {/* Reels & Short Video Admin Routes */}
            <Route path="/admin/reels" component={ReelsManagement} />
            {/* Creator Battles Admin Routes */}
            <Route path="/admin/battles" component={BattlesManagement} />
            {/* AI Clone Chatbot Admin Routes */}
            <Route path="/admin/ai-clones" component={AICloneManagement} />
            {/* Auctions & Tip Goals Admin Routes */}
            <Route path="/admin/auctions" component={AuctionsManagement} />
            {/* Watch Parties & Collabs Admin Routes */}
            <Route path="/admin/watch-parties" component={WatchPartiesManagement} />
            {/* Safety Center Admin Routes */}
            <Route path="/admin/safety" component={SafetyCenter} />
            {/* Platform Management Admin Routes */}
            <Route path="/admin/branding" component={BrandingManagement} />
            <Route path="/admin/bookings" component={BookingManagement} />
            <Route path="/admin/appearance" component={SiteAppearance} />
            <Route path="/admin/theme-editor" component={ThemeEditor} />
            <Route path="/admin/gallery" component={GalleryManagement} />
            <Route path="/settings" component={Settings} />
            <Route path="/creator/:userId" component={CreatorProfile} />
            <Route path="/naughty-profile" component={NaughtyProfile} />
            <Route path="/fuck-buddies" component={NaughtyProfile} />
            <Route path="/feed" component={PostsFeed} />
            <Route path="/fanz-feed" component={FanzFeed} />
            <Route path="/infinity-feed" component={InfinityFeed} />
            <Route path="/fanz-money-center" component={FanzMoneyCenter} />
            <Route path="/revenue-quests" component={RevenueQuests} />
            <Route path="/trust" component={TrustDashboard} />
            <Route path="/search" component={SearchCreators} />
            <Route path="/messages" component={Messages} />
            <Route path="/mass-messaging" component={MassMessaging} />
            <Route path="/post/:postId" component={PostView} />
            <Route path="/earnings" component={EarningsPage} />
            <Route path="/studio" component={CreatorStudio} />
            <Route path="/creator-studio" component={CreatorStudio} />
            <Route path="/collaborations" component={Collaborations} />
            <Route path="/collab" component={Collaborations} />
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
            {/* Special Tabs */}
            <Route path="/gay" component={GayTab} />
            <Route path="/outlawz" component={OutlawzTab} />
            {/* Help Center Routes */}
            <Route path="/help" component={HelpCenter} />
            <Route path="/help/wiki" component={WikiPage} />
            <Route path="/help/tutorials" component={TutorialsPage} />
            <Route path="/help/tickets/new" component={TicketCreationPage} />
            <Route path="/help/tickets/:ticketId">
              {(params) => <TicketDetailPage ticketId={params.ticketId} />}
            </Route>
            <Route path="/help/tickets" component={TicketsPage} />
            <Route path="/help/chat" component={ChatPage} />
            {/* Legal Pages Routes */}
            <Route path="/legal" component={LegalLibrary} />
            <Route path="/legal/terms" component={Terms} />
            <Route path="/legal/privacy" component={Privacy} />
            <Route path="/legal/dmca" component={DMCA} />
            <Route path="/legal/2257" component={Compliance2257} />
            <Route path="/legal/content-guidelines" component={ContentGuidelines} />
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
  useCommonShortcuts(); // Enable keyboard navigation

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScreenshotProtectionProvider config={screenshotProtectionConfig}>
          <div className="dark">
            <Toaster />
            <GDPRConsentBanner />
            <AIChatBot />
            <Router />
          </div>
        </ScreenshotProtectionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
