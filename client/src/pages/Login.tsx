/**
 * BOYFANZ Login Page
 *
 * Youth. Energy. Adventure.
 * Redirects to SSO service for OAuth flow
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { fanzSDK } from '@/lib/fanzSDK';

export default function Login() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    // If already authenticated, redirect to home
    if (fanzSDK.isAuthenticated()) {
      const returnTo = searchParams.get('returnTo') || '/';
      setLocation(returnTo);
    }
  }, [setLocation, searchParams]);

  const handleLogin = async () => {
    try {
      console.log('[BOYFANZ SSO] Initiating login flow');
      // This will redirect to the SSO service
      await fanzSDK.login();
    } catch (error) {
      console.error('[BOYFANZ SSO] Login initiation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-boy-bg-primary flex items-center justify-center">
      {/* BOYFANZ Gradient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-boy-glow opacity-30 animate-float" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-boy-glow opacity-20" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="relative z-10 max-w-md w-full px-6">
        <div className="bg-boy-bg-secondary border border-boy-border rounded-3xl p-8 shadow-2xl">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-boy-gradient rounded-full">
                <span className="text-4xl">⚡</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-boy-gradient-text bg-clip-text text-transparent">
                BOYFANZ
              </span>
            </h1>
            <p className="text-boy-text-secondary text-lg">
              Youth. Energy. Adventure.
            </p>
          </div>

          {/* Welcome Message */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-boy-text-primary mb-2">
              Welcome Back!
            </h2>
            <p className="text-boy-text-secondary">
              Sign in to access the vibrant platform for boy creators
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-boy-gradient hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In with SSO</span>
            </div>
          </button>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-boy-border">
            <p className="text-sm text-boy-text-muted text-center mb-4">
              Join the community to:
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-boy-text-secondary text-sm">
                <span className="text-boy-accent mr-2">✓</span>
                <span>Share your energy</span>
              </div>
              <div className="flex items-center text-boy-text-secondary text-sm">
                <span className="text-boy-accent mr-2">✓</span>
                <span>Connect with enthusiastic fans</span>
              </div>
              <div className="flex items-center text-boy-text-secondary text-sm">
                <span className="text-boy-accent mr-2">✓</span>
                <span>Live your adventure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-boy-text-muted text-sm mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
