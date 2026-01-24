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

// Live Streaming pages
import { GoLivePage, WatchStreamPage, LiveStreamsPage, VideoCallPage } from "@/pages/live";

console.log('[BOYFANZ] Stable App loading...');

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
        <Route path="/login" component={Login} />
        <Route path="/signin" component={Login} />
        <Route path="/creator/:userId" component={CreatorProfile} />
        <Route path="/search" component={SearchCreators} />
        <Route path="/blog" component={Blog} />
        <Route path="/contact" component={Contact} />
        <Route path="/safety" component={SafetyCenter} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/help" component={HelpCenter} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Authenticated users should go to dashboard, not landing
  return (
    <Switch>
      <Route path="/">
        {() => {
          // Redirect authenticated users to dashboard
          navigate('/dashboard');
          return null;
        }}
      </Route>
      <Route path="/auth/login" component={LoginNew} />
      <Route path="/auth/register" component={Register} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/feed" component={PostsFeed} />
      <Route path="/social" component={SocialHome} />
      <Route path="/messages" component={Messages} />
      <Route path="/media" component={Media} />
      <Route path="/settings" component={Settings} />
      <Route path="/creator/:userId" component={CreatorProfile} />
      <Route path="/search" component={SearchCreators} />
      <Route path="/blog" component={Blog} />
      <Route path="/contact" component={Contact} />
      <Route path="/safety" component={SafetyCenter} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/panel/admin/dashboard" component={AdminDashboard} />
      <Route path="/panel/admin/users" component={UserManagement} />
      <Route path="/panel/admin/moderation" component={ModerationQueue} />
      <Route path="/live" component={LiveStreamsPage} />
      <Route path="/live/go-live" component={GoLivePage} />
      <Route path="/live/watch/:roomName" component={WatchStreamPage} />
      <Route path="/video-call/:roomName" component={VideoCallPage} />
      <Route path="/video-call/start/:userId" component={VideoCallPage} />
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
