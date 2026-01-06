// @ts-nocheck
import { useCommonShortcuts } from '@/components/accessibility/KeyboardNavigation';
import { ScreenshotProtectionProvider } from '@/components/security/ScreenshotProtection';
import { PlatformProvider } from '@/contexts/PlatformContext';
import screenshotProtectionConfig from './config/screenshot-protection';
import { StickyFooterAd, StickyTopAd } from '@/components/ads/AdBanner';
import { UndergroundLoader } from '@/components/ui/underground-loader';
import Footer from '@/components/Footer';
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
import NearbyFans from "@/pages/NearbyFans";
import CreatorNearbyMe from "@/pages/Creator/NearbyMe";
import ModerationQueue from "@/pages/admin/ModerationQueue";
import UserManagement from "@/pages/admin/UserManagement";
import DelegationManager from "@/pages/admin/DelegationManager";
import ThemeManager from "@/pages/admin/ThemeManager";
import AdminDashboard from "@/pages/admin/Dashboard";
import ForumsManagement from "@/pages/admin/ForumsManagement";
import ComplaintsManagement from "@/pages/admin/Complaints";
import WithdrawalsManagement from "@/pages/admin/Withdrawals";
import VerificationManagement from "@/pages/admin/Verification";
import AdminReports from "@/pages/admin/Reports";
import CompliancePage from "@/pages/admin/Compliance";
import SecurityDashboard from "@/pages/admin/SecurityDashboard";

// Auth
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
// Content Management Admin Pages
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import AuthComplete from '@/pages/AuthComplete';
import AuthError from '@/pages/AuthError';
import PostsManagement from "@/pages/admin/PostsManagement";
import LiveStreaming from "@/pages/admin/LiveStreaming";
import StoriesManagement from "@/pages/admin/StoriesManagement";
import ShopManagement from "@/pages/admin/ShopManagement";
import CategoriesManagement from "@/pages/admin/CategoriesManagement";
// Financial Management Admin Pages
import TransactionsManagement from "@/pages/admin/TransactionsManagement";
import BillingManagement from "@/pages/admin/BillingManagement";
import TaxRatesManagement from "@/pages/admin/TaxRatesManagement";
import PaymentSettings from "@/pages/admin/PaymentSettings";
import DepositsManagement from "@/pages/admin/DepositsManagement";
import OAuthSettings from "@/pages/admin/OAuthSettings";
// Additional Admin Pages
import AnnouncementsManagement from "@/pages/admin/AnnouncementsManagement";
import CommentsManagement from "@/pages/admin/CommentsManagement";
import MessagesManagement from "@/pages/admin/MessagesManagement";
import PushNotifications from "@/pages/admin/PushNotifications";
import UnifiedStorageManagement from "@/pages/admin/UnifiedStorageManagement";
import SystemSettings from "@/pages/admin/SystemSettings";
import EmailManagement from "@/pages/admin/EmailManagement";
import PlatformManagement from "@/pages/admin/PlatformManagement";
import DataPrivacy from "@/pages/admin/DataPrivacy";
import BrandingManagement from "@/pages/admin/BrandingManagement";
import BookingManagement from "@/pages/admin/BookingManagement";
import SiteAppearance from "@/pages/admin/SiteAppearance";
import GalleryManagement from "@/pages/admin/GalleryManagement";
import AgentsManagement from "@/pages/admin/Agents";
import SocialOAuthSettings from "@/pages/admin/SocialOAuthSettings";
// TODO: Re-enable after fixing CMS tables
// import PageEditor from "@/pages/admin/Pages/PageEditor";
// New Admin Pages (37-section complete admin panel)
import SettingsLimits from "@/pages/admin/SettingsLimits";
import VideoEncoding from "@/pages/admin/VideoEncoding";
import ConsentForms from "@/pages/admin/ConsentForms";
import ConsentWithdrawalForms from "@/pages/admin/ConsentWithdrawalForms";
import LeaderboardScores from "@/pages/admin/LeaderboardScores";
import UserAds from "@/pages/admin/UserAds";
import SubscriptionsManagement from "@/pages/admin/SubscriptionsManagement";
import LivestreamSettings from "@/pages/admin/LivestreamSettings";
import LivestreamRequests from "@/pages/admin/LivestreamRequests";
import Products from "@/pages/admin/Products";
import Sales from "@/pages/admin/Sales";
import CustomCodeEditor from "@/pages/admin/CustomCodeEditor";
import ReferralsManagement from "@/pages/admin/ReferralsManagement";
import Languages from "@/pages/admin/Languages";
import PagesManagement from "@/pages/admin/PagesManagement";
import BlogManagement from "@/pages/admin/BlogManagement";
import PWASettings from "@/pages/admin/PWASettings";
import SocialProfiles from "@/pages/admin/SocialProfiles";
import Docs from '@/pages/Docs';
import GoogleSettings from "@/pages/admin/GoogleSettings";
// CoStar Verification (Public)
import CoStarVerify from "@/pages/CoStarVerify";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import Sidebar, { useSidebarCollapse } from "@/components/layout/Sidebar";
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
import StarzElite from "@/pages/StarzElite";
import BreedingZoneSignup from "@/pages/auth/BreedingZoneSignup";
import FanzSignup from "@/pages/auth/FanzSignup";
import ResetPassword from "@/pages/auth/ResetPassword";
// Creator Economy pages
import CreatorProfile from "@/pages/CreatorProfile";
import PostsFeed from "@/pages/PostsFeed";
import SearchCreators from "@/pages/SearchCreators";
import Messages from "@/pages/Messages";
import MassMessaging from "@/pages/MassMessaging";
import PostView from "@/pages/PostView";
import EarningsPage from "@/pages/Creator/EarningsPage";
import FreeLinksPage from "@/pages/Creator/FreeLinksPage";
import FreeLinkRedeem from "@/pages/FreeLinkRedeem";
import BoyFanzSPA from "@/pages/BoyFanzSPA";
import FanzCock from "@/pages/FanzCock";
import Bathhouse from "@/pages/Bathhouse";
// Bathhouse Zone Pages
import LockerRoom from "@/pages/bathhouse/LockerRoom";
import Showers from "@/pages/bathhouse/Showers";
import SteamRoom from "@/pages/bathhouse/SteamRoom";
import Sauna from "@/pages/bathhouse/Sauna";
import Pool from "@/pages/bathhouse/Pool";
import Gym from "@/pages/bathhouse/Gym";
import PrivateRooms from "@/pages/bathhouse/PrivateRooms";
import SlingRoom from "@/pages/bathhouse/SlingRoom";
import FuckBench from "@/pages/bathhouse/FuckBench";
import Voyeur from "@/pages/bathhouse/Voyeur";
import DarkRoom from "@/pages/bathhouse/DarkRoom";
import VIPLounge from "@/pages/bathhouse/VIPLounge";
import CreatorProDashboard from "@/pages/CreatorProDashboard";
import FanzMoneyCenter from "@/pages/FanzMoneyCenter";
import RevenueQuests from "@/pages/RevenueQuests";
import TrustDashboard from "@/pages/TrustDashboard";
import BreedingZone from "@/pages/BreedingZone";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import SafetyCenter from "@/pages/SafetyCenter";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import WittleBearFoundation from "@/pages/WittleBearFoundation";
// Policy Pages
import AboutUs from "@/pages/AboutUs";
import ContentPolicy from "@/pages/ContentPolicy";
import CookiesPolicy from "@/pages/CookiesPolicy";
import LegalEthicsPolicy from "@/pages/LegalEthicsPolicy";
import ComplaintPolicy from "@/pages/ComplaintPolicy";
import CancellationPolicy from "@/pages/CancellationPolicy";
import ModelReleaseStar from "@/pages/ModelReleaseStar";
import ModelReleaseCostar from "@/pages/ModelReleaseCostar";
import TransactionPolicy from "@/pages/TransactionPolicy";
import BecomeVIP from "@/pages/BecomeVIP";
// Outlawz & Naughty Social pages
import Outlawz from "@/pages/Outlawz";
import NaughtyProfile from "@/pages/NaughtyProfile";
// Forum pages
import ForumsHome from "@/pages/forums/ForumsHome";
import ForumCategory from "@/pages/forums/ForumCategory";
import ForumTopic from "@/pages/forums/ForumTopic";
import CreateTopic from "@/pages/forums/CreateTopic";
// New pages for sidebar navigation
import Wallet from "@/pages/Wallet";
import Referrals from "@/pages/Referrals";
import Stories from "@/pages/Stories";
import SavedPosts from "@/pages/SavedPosts";
import Withdrawals from "@/pages/Withdrawals";
import Payments from "@/pages/Payments";
import PaymentsReceived from "@/pages/PaymentsReceived";
// Settings sub-pages
import PrivacySettings from "@/pages/settings/Privacy";
import PasswordSettings from "@/pages/settings/Password";
import CountriesSettings from "@/pages/settings/Countries";
import RestrictedSettings from "@/pages/settings/Restricted";
import { HelpCenter } from "@/pages/HelpCenter";
import CivilResources from "@/pages/CivilResources";
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
import FuckBuddies from "@/pages/FuckBuddies";
import TutorialBot from "@/components/TutorialBot/TutorialBot";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";

// Redirect components for legacy routes
function StarzStudioRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/breeding-zone');
  }, [setLocation]);
  return null;
}

function StarzMembershipRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/breeding-zone');
  }, [setLocation]);
  return null;
}

// Admin panel redirect components
function AdminPanelRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/dashboard');
  }, [setLocation]);
  return null;
}

function AdminDashboardRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/dashboard');
  }, [setLocation]);
  return null;
}

function AdminMessagesRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/messages');
  }, [setLocation]);
  return null;
}

function AdminCategoriesRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/categories');
  }, [setLocation]);
  return null;
}

function AdminShopRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/shop');
  }, [setLocation]);
  return null;
}

function AdminStoriesRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/stories');
  }, [setLocation]);
  return null;
}

function AdminStreamingRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/streaming');
  }, [setLocation]);
  return null;
}

function AdminPostsRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/posts');
  }, [setLocation]);
  return null;
}

function AdminThemesRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/themes');
  }, [setLocation]);
  return null;
}

function AdminUsersRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/users');
  }, [setLocation]);
  return null;
}

function AdminTaxRatesRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/tax-rates');
  }, [setLocation]);
  return null;
}

function AdminDepositsRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/deposits');
  }, [setLocation]);
  return null;
}

function AdminAnnouncementsRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/announcements');
  }, [setLocation]);
  return null;
}

function AdminPushNotificationsRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/push-notifications');
  }, [setLocation]);
  return null;
}

function AdminEmailMarketingRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/email-marketing');
  }, [setLocation]);
  return null;
}

function AdminSystemSettingsRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/panel/admin/system-settings');
  }, [setLocation]);
  return null;
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  useTheme(); // Apply active theme
  useWebSocketInit(); // Initialize WebSocket connection
  
  // PWA Initialization
  useEffect(() => {
    // Note: pwaManager.getInstance() already calls init() automatically,
    // so we don't need to call it again here. The singleton pattern
    // ensures only one initialization happens.

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
  const protectedRoutes = ['/feed', '/infinity-feed', '/fanzccock', '/reels', '/messages', '/mass-messaging', '/post', '/earnings', '/media', '/compliance', '/payouts', '/notifications', '/settings', '/admin', '/purchased', '/subscriptions', '/release-forms', '/nearby', '/streams', '/revenue-quests', '/trust', '/fanz-money-center', '/wallet', '/referrals', '/saved', '/stories', '/withdrawals', '/payments', '/events', '/custom-requests', '/creator-requests', '/bathhouse'];
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => location.startsWith(route));

  // Redirect to login if trying to access protected route while unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      navigate('/auth/login');
    }
  }, [isLoading, isAuthenticated, isProtectedRoute, navigate]);

  // Show simplified loading, but don't block forever
  // Only show loader if still actively loading AND haven't timed out
  if (isLoading && !loadingTimeout) {
    return (
      <UndergroundLoader
        isVisible={true}
        message="Entering the Underground..."
        variant="full_experience"
        soundEnabled={false}
      />
    );
  }

  // IMPORTANT: If loading timed out but we're still loading,
  // treat as authenticated to allow route access (prevents false 404s)
  // The actual auth state will resolve and re-render appropriately
  const effectivelyAuthenticated = isAuthenticated || (loadingTimeout && isLoading);

  if (!effectivelyAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        {/* SSO Authentication */}
        <Route path="/auth-complete" component={AuthComplete} />
        <Route path="/auth-error" component={AuthError} />
        {/* Email/Password Authentication */}
        <Route path="/auth/register" component={Register} />
        <Route path="/auth/login" component={LoginNew} />
        <Route path="/auth/forgot-password" component={ForgotPassword} />
        <Route path="/auth/reset-password" component={ResetPasswordNew} />
        <Route path="/auth/verify-email" component={VerifyEmail} />
        <Route path="/auth/resend-verification" component={ResendVerification} />
        <Route path="/auth/breeding-zone-signup" component={BreedingZoneSignup} />
        {/* Legacy routes (deprecated) */}
        <Route path="/auth/starz-signup" component={StarzSignup} />
        <Route path="/auth/fanz-signup" component={FanzSignup} />
        {/* Starz Elite Landing */}
        <Route path="/starz-elite" component={StarzElite} />
        <Route path="/auth/login-old" component={Login} />
        <Route path="/auth/reset-password-old" component={ResetPassword} />
        {/* Public pages for discovery */}
        <Route path="/creator/:userId" component={CreatorProfile} />
        <Route path="/search" component={SearchCreators} />
        <Route path="/blog" component={Blog} />
        <Route path="/contact" component={Contact} />
        <Route path="/safety" component={SafetyCenter} />
        <Route path="/resources" component={CivilResources} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/wittle-bear-foundation" component={WittleBearFoundation} />
        {/* Outlawz & Naughty Social Routes */}
        <Route path="/outlawz" component={Outlawz} />
        <Route path="/profile/:userId" component={NaughtyProfile} />
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
      <MainContent user={user} />
    </div>
  );
}

// Main content wrapper that reacts to sidebar collapse state
function MainContent({ user }: { user: any }) {
  const { isCollapsed } = useSidebarCollapse();

  return (
    <>
      {/* Top banner - fixed at very top */}
      <StickyTopAd />

      <div className={cn(
        "transition-all duration-300 pt-[60px]", // Push content down for top banner
        isCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        <Header user={user} />
        <main className="p-4 md:p-6 bg-transparent pb-40 md:pb-24">
          <Switch>
            <Route path="/" component={SocialHome} />
            <Route path="/social" component={SocialHome} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/breeding-zone" component={BreedingZone} />
            {/* Legacy redirects */}
            <Route path="/starz-studio" component={StarzStudioRedirect} />
            <Route path="/starz-membership" component={StarzMembershipRedirect} />
            <Route path="/media" component={Media} />
            <Route path="/compliance" component={Compliance} />
            <Route path="/payouts" component={Payouts} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/purchased" component={Purchased} />
            <Route path="/subscriptions" component={Subscriptions} />
            <Route path="/release-forms" component={ReleaseForms} />
            {/* Fan Discovery - Cross-platform fan-to-fan connections */}
            <Route path="/nearby" component={NearbyFans} />
            {/* Creator Discovery - Verified creators only, cross-platform networking */}
            <Route path="/creator/nearby" component={CreatorNearbyMe} />
            <Route path="/fuck-buddies" component={FuckBuddies} />
            {/* ADMIN PANEL - All 37 Sections at /panel/admin/* */}
            {/* Core Admin Routes */}
            <Route path="/panel/admin/dashboard" component={AdminDashboard} />
            <Route path="/panel/admin/complaints" component={ComplaintsManagement} />
            <Route path="/panel/admin/withdrawals" component={WithdrawalsManagement} />
            <Route path="/panel/admin/verification" component={VerificationManagement} />
            <Route path="/panel/admin/moderation" component={ModerationQueue} />
            <Route path="/panel/admin/forums" component={ForumsManagement} />
            <Route path="/panel/admin/moderation-queue" component={ModerationQueue} />
            <Route path="/panel/admin/users" component={UserManagement} />
            <Route path="/panel/admin/delegation" component={DelegationManager} />
            <Route path="/panel/admin/themes" component={ThemeManager} />
            <Route path="/panel/admin/reports" component={AdminReports} />
            <Route path="/panel/admin/compliance" component={CompliancePage} />
            <Route path="/panel/admin/security" component={SecurityDashboard} />
            {/* Content Management */}
            <Route path="/panel/admin/posts" component={PostsManagement} />
            <Route path="/panel/admin/streaming" component={LiveStreaming} />
            <Route path="/panel/admin/stories" component={StoriesManagement} />
            <Route path="/panel/admin/shop" component={ShopManagement} />
            <Route path="/panel/admin/categories" component={CategoriesManagement} />
            <Route path="/panel/admin/pages" component={PagesManagement} />
            <Route path="/panel/admin/blog" component={BlogManagement} />
            {/* Financial Management */}
            <Route path="/panel/admin/transactions" component={TransactionsManagement} />
            <Route path="/panel/admin/billing" component={BillingManagement} />
            <Route path="/panel/admin/tax-rates" component={TaxRatesManagement} />
            <Route path="/panel/admin/payment-settings" component={PaymentSettings} />
            <Route path="/panel/admin/deposits" component={DepositsManagement} />
            <Route path="/panel/admin/sales" component={Sales} />
            <Route path="/panel/admin/products" component={Products} />
            {/* Subscriptions & Users */}
            <Route path="/panel/admin/subscriptions" component={SubscriptionsManagement} />
            <Route path="/panel/admin/user-ads" component={UserAds} />
            <Route path="/panel/admin/referrals" component={ReferralsManagement} />
            <Route path="/panel/admin/leaderboard" component={LeaderboardScores} />
            {/* Livestreaming */}
            <Route path="/panel/admin/livestream-settings" component={LivestreamSettings} />
            <Route path="/panel/admin/livestream-requests" component={LivestreamRequests} />
            {/* Compliance & Legal */}
            <Route path="/panel/admin/consent-forms" component={ConsentForms} />
            <Route path="/panel/admin/consent-withdrawal" component={ConsentWithdrawalForms} />
            {/* Platform Configuration */}
            <Route path="/panel/admin/oauth-settings" component={OAuthSettings} />
            <Route path="/panel/admin/announcements" component={AnnouncementsManagement} />
            <Route path="/panel/admin/comments" component={CommentsManagement} />
            <Route path="/panel/admin/messages" component={MessagesManagement} />
            <Route path="/panel/admin/push-notifications" component={PushNotifications} />
            <Route path="/panel/admin/storage" component={UnifiedStorageManagement} />
            <Route path="/panel/admin/system-settings" component={SystemSettings} />
            <Route path="/panel/admin/email-marketing" component={EmailManagement} />
            <Route path="/panel/admin/platforms" component={PlatformManagement} />
            <Route path="/panel/admin/data-privacy" component={DataPrivacy} />
            <Route path="/panel/admin/agents" component={AgentsManagement} />
            <Route path="/panel/admin/branding" component={BrandingManagement} />
            <Route path="/panel/admin/bookings" component={BookingManagement} />
            <Route path="/panel/admin/appearance" component={SiteAppearance} />
            <Route path="/panel/admin/gallery" component={GalleryManagement} />
            <Route path="/admin/pages" component={PagesManagement} />
            {/* TODO: Re-enable after fixing CMS tables */}
            {/* <Route path="/admin/pages/editor" component={PageEditor} /> */}
            <Route path="/panel/admin/settings-limits" component={SettingsLimits} />
            <Route path="/panel/admin/video-encoding" component={VideoEncoding} />
            <Route path="/panel/admin/custom-code" component={CustomCodeEditor} />
            <Route path="/panel/admin/languages" component={Languages} />
            <Route path="/panel/admin/pwa-settings" component={PWASettings} />
            <Route path="/panel/admin/social-profiles" component={SocialProfiles} />
            <Route path="/panel/admin/oauth-settings" component={SocialOAuthSettings} />
            <Route path="/panel/admin/google-settings" component={GoogleSettings} />
            {/* Admin Panel Redirects */}
            <Route path="/panel/admin" component={AdminPanelRedirect} />
            {/* Legacy /admin/* redirects to /panel/admin/* */}
            <Route path="/admin" component={AdminPanelRedirect} />
            <Route path="/admin/dashboard" component={AdminDashboardRedirect} />
            <Route path="/admin/messages" component={AdminMessagesRedirect} />
            <Route path="/admin/categories" component={AdminCategoriesRedirect} />
            <Route path="/admin/shop" component={AdminShopRedirect} />
            <Route path="/admin/stories" component={AdminStoriesRedirect} />
            <Route path="/admin/streaming" component={AdminStreamingRedirect} />
            <Route path="/admin/posts" component={AdminPostsRedirect} />
            <Route path="/admin/themes" component={AdminThemesRedirect} />
            <Route path="/admin/users" component={AdminUsersRedirect} />
            <Route path="/admin/tax-rates" component={AdminTaxRatesRedirect} />
            <Route path="/admin/deposits" component={AdminDepositsRedirect} />
            <Route path="/admin/announcements" component={AdminAnnouncementsRedirect} />
            <Route path="/admin/push-notifications" component={AdminPushNotificationsRedirect} />
            <Route path="/admin/email-marketing" component={AdminEmailMarketingRedirect} />
            <Route path="/admin/system-settings" component={AdminSystemSettingsRedirect} />
            <Route path="/settings" component={Settings} />
            <Route path="/settings/privacy" component={PrivacySettings} />
            {/* New sidebar navigation routes */}
            <Route path="/wallet" component={Wallet} />
            <Route path="/referrals" component={Referrals} />
            <Route path="/saved" component={SavedPosts} />
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
            <Route path="/outlawz" component={Outlawz} />
            <Route path="/feed" component={PostsFeed} />
            <Route path="/spa" component={BoyFanzSPA} />
            <Route path="/infinity-feed" component={BoyFanzSPA} /> {/* Legacy redirect */}
            <Route path="/fanzccock" component={FanzCock} />
            <Route path="/reels" component={FanzCock} />
            <Route path="/bathhouse" component={Bathhouse} />
            <Route path="/bathhouse/locker-room" component={LockerRoom} />
            <Route path="/bathhouse/showers" component={Showers} />
            <Route path="/bathhouse/steam-room" component={SteamRoom} />
            <Route path="/bathhouse/sauna" component={Sauna} />
            <Route path="/bathhouse/pool" component={Pool} />
            <Route path="/bathhouse/gym" component={Gym} />
            <Route path="/bathhouse/private-rooms" component={PrivateRooms} />
            <Route path="/bathhouse/sling-room" component={SlingRoom} />
            <Route path="/bathhouse/fuck-bench" component={FuckBench} />
            <Route path="/bathhouse/voyeur" component={Voyeur} />
            <Route path="/bathhouse/dark-room" component={DarkRoom} />
            <Route path="/bathhouse/vip" component={VIPLounge} />
            <Route path="/fanz-money-center" component={FanzMoneyCenter} />
            <Route path="/revenue-quests" component={RevenueQuests} />
            <Route path="/trust" component={TrustDashboard} />
            <Route path="/search" component={SearchCreators} />
            <Route path="/messages" component={Messages} />
            <Route path="/mass-messaging" component={MassMessaging} />
            <Route path="/post/:postId" component={PostView} />
            <Route path="/earnings" component={EarningsPage} />
            <Route path="/free-links" component={FreeLinksPage} />
            <Route path="/free/:slug" component={FreeLinkRedeem} />
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
            <Route path="/resources" component={CivilResources} />
            <Route path="/terms" component={TermsOfService} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route path="/about" component={AboutUs} />
            <Route path="/content-policy" component={ContentPolicy} />
            <Route path="/cookies" component={CookiesPolicy} />
            <Route path="/legal-ethics" component={LegalEthicsPolicy} />
            <Route path="/complaint-policy" component={ComplaintPolicy} />
            <Route path="/cancellation" component={CancellationPolicy} />
            <Route path="/model-release-star" component={ModelReleaseStar} />
            <Route path="/model-release-costar" component={ModelReleaseCostar} />
            <Route path="/transaction-policy" component={TransactionPolicy} />
            <Route path="/vip" component={BecomeVIP} />
            <Route path="/wittle-bear-foundation" component={WittleBearFoundation} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>

      {/* Footer with copyright and policy links */}
      <Footer />

      {/* Sticky Footer Ad - Premium, Non-intrusive */}
      <StickyFooterAd />

      {/* Tutorial Bot - Guides users through the platform */}
      <TutorialBot />

      {/* Mobile Bottom Navigation - iOS/Android style tab bar */}
      <MobileBottomNav />
    </>
  );
}

// App wrapper with providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          {/* Public Routes - No Layout */}
          <Route path="/login" component={Login} />
          <Route path="/auth/callback" component={AuthCallback} />

          {/* All other routes handled by Router */}
          <Route path="/*">
            <ScreenshotProtectionProvider config={screenshotProtectionConfig}>
              <PlatformProvider>
                <TooltipProvider>
                  <Router />
                </TooltipProvider>
              </PlatformProvider>
            </ScreenshotProtectionProvider>
          </Route>
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
