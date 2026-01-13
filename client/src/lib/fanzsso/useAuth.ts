/**
 * FanzSSO Auth Hook
 *
 * React hook for accessing authentication state.
 */

import { useState, useEffect, useCallback } from 'react';
import type { SSOUser, Entitlements, AuthResponse } from './types';

export interface UseAuthOptions {
  /** Auto-fetch user on mount */
  autoFetch?: boolean;
  /** Custom API base URL */
  apiBaseUrl?: string;
  /** Fetch entitlements along with user */
  includeEntitlements?: boolean;
}

export interface UseAuthReturn {
  /** Current user (null if not authenticated) */
  user: SSOUser | null;
  /** User entitlements */
  entitlements: Entitlements | null;
  /** Whether authentication is being checked */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user is admin */
  isAdmin: boolean;
  /** Whether user is super admin */
  isSuperAdmin: boolean;
  /** Whether user is creator */
  isCreator: boolean;
  /** Error message if any */
  error: string | null;
  /** Manually refresh auth state */
  refresh: () => Promise<void>;
  /** Logout the user */
  logout: (global?: boolean) => Promise<void>;
  /** Redirect to login */
  login: (returnTo?: string) => void;
}

/**
 * Hook for accessing FanzSSO authentication state
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const {
    autoFetch = true,
    apiBaseUrl = '',
    includeEntitlements = false,
  } = options;

  const [user, setUser] = useState<SSOUser | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/auth/user`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data: AuthResponse = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);

        // Fetch entitlements if requested
        if (includeEntitlements) {
          const entResponse = await fetch(`${apiBaseUrl}/api/entitlements`, {
            credentials: 'include',
          });
          if (entResponse.ok) {
            const entData = await entResponse.json();
            setEntitlements(entData.entitlements);
          }
        }
      } else {
        setUser(null);
        setEntitlements(null);
      }
    } catch (err) {
      console.error('[FanzSSO] Auth fetch error:', err);
      setError(err instanceof Error ? err.message : 'Authentication error');
      setUser(null);
      setEntitlements(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, includeEntitlements]);

  const logout = useCallback(
    async (global = false) => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/logout${global ? '?global=true' : ''}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (response.ok) {
          setUser(null);
          setEntitlements(null);

          // If global logout, the response might redirect
          if (global && response.redirected) {
            window.location.href = response.url;
          }
        }
      } catch (err) {
        console.error('[FanzSSO] Logout error:', err);
      }
    },
    [apiBaseUrl]
  );

  const login = useCallback(
    (returnTo?: string) => {
      const loginUrl = returnTo
        ? `${apiBaseUrl}/auth/sso/login?returnTo=${encodeURIComponent(returnTo)}`
        : `${apiBaseUrl}/auth/sso/login`;
      window.location.href = loginUrl;
    },
    [apiBaseUrl]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchUser();
    }
  }, [autoFetch, fetchUser]);

  return {
    user,
    entitlements,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isSuperAdmin: user?.isSuperAdmin || false,
    isCreator: user?.isCreator || false,
    error,
    refresh: fetchUser,
    logout,
    login,
  };
}

export default useAuth;
