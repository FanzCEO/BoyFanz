/**
 * Auth Complete Page
 *
 * This page is called after SSO callback completes. It fetches the user session from
 * the server and generates a local client token, storing it in localStorage before
 * redirecting to the final destination. This bridges the gap between server-side
 * session authentication and client-side token storage.
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { fanzSDK } from '@/lib/fanzSDK';

export default function AuthComplete() {
  const [location, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const returnTo = params.get('returnTo') || '/';

        console.log('[AuthComplete] Fetching user session from server...');

        // Fetch current user from server (session-based auth)
        const response = await fetch('/api/auth/user', {
          credentials: 'include', // Important: include cookies
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user session');
        }

        const data = await response.json();

        if (!data.authenticated || !data.user) {
          throw new Error('User not authenticated');
        }

        console.log('[AuthComplete] User authenticated:', data.user.email);

        // Generate a local token for the user (just use user ID as token for simplicity)
        // In production, this should be a proper JWT signed by the server
        const localToken = `boyfanz_${data.user.id}_${Date.now()}`;

        // Store user data in fanzSDK
        fanzSDK.setTokens(localToken);
        fanzSDK.setUser({
          id: data.user.id,
          email: data.user.email,
          handle: data.user.username,
          displayName: data.user.firstName || data.user.username,
          avatarUrl: data.user.profileImageUrl,
          isCreator: data.user.isCreator,
          roles: data.user.roles,
        });

        console.log('[AuthComplete] Local auth state initialized successfully');

        // Small delay to ensure localStorage is written
        setTimeout(() => {
          console.log('[AuthComplete] Redirecting to:', returnTo);
          // Force a full page reload to ensure AuthContext picks up the new state
          window.location.href = returnTo;
        }, 100);
      } catch (err) {
        console.error('[AuthComplete] Error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          setLocation('/auth/login');
        }, 3000);
      }
    };

    completeAuth();
  }, [location, setLocation]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-xl">⚠️</div>
          <p className="text-white text-lg mb-2">Authentication Error</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p className="text-white text-lg">Completing authentication...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
}
