/**
 * BOYFANZ OAuth Callback Handler
 *
 * Handles the OAuth redirect from SSO service:
 * 1. Extracts authorization code from URL
 * 2. Exchanges code for tokens via fanzSDK
 * 3. Redirects to intended destination
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { fanzSDK } from '@/lib/fanzSDK';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract authorization code from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const returnTo = urlParams.get('returnTo') || '/';

        if (!code) {
          throw new Error('No authorization code received');
        }

        console.log('[BOYFANZ SSO] Processing callback with code:', code.substring(0, 10) + '...');

        // Exchange code for tokens - this will store them in platform-specific localStorage
        await fanzSDK.handleCallback(code);

        console.log('[BOYFANZ SSO] Tokens stored successfully');
        console.log('[BOYFANZ SSO] Access token:', fanzSDK.getAccessToken()?.substring(0, 20) + '...');
        console.log('[BOYFANZ SSO] Authenticated:', fanzSDK.isAuthenticated());

        setStatus('success');

        // Redirect to intended destination after short delay
        setTimeout(() => {
          setLocation(returnTo);
        }, 1000);

      } catch (err) {
        console.error('[BOYFANZ SSO] Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');

        // Redirect to login after error
        setTimeout(() => {
          setLocation('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-boy-bg-primary flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        {/* BOYFANZ Gradient Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-boy-glow opacity-30 animate-float" />
        </div>

        <div className="relative z-10 bg-boy-bg-secondary border border-boy-border rounded-2xl p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-boy-accent border-t-transparent rounded-full animate-spin" />
              <h2 className="text-2xl font-bold text-boy-text-primary mb-2">
                Completing Sign-In...
              </h2>
              <p className="text-boy-text-secondary">
                Please wait while we authenticate you
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-boy-text-primary mb-2">
                Welcome to BOYFANZ!
              </h2>
              <p className="text-boy-text-secondary">
                Redirecting you now...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-boy-text-primary mb-2">
                Authentication Failed
              </h2>
              <p className="text-boy-text-secondary mb-4">
                {error || 'Something went wrong during sign-in'}
              </p>
              <p className="text-sm text-boy-text-muted">
                Redirecting to login...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
