/**
 * BOYFANZ Authentication Context
 *
 * Provides authentication state and methods throughout the app
 * Uses platform-specific token storage (boyfanz_access_token)
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fanzSDK } from '@/lib/fanzSDK';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authenticated = fanzSDK.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      console.log('[BOYFANZ Auth] Authentication status:', authenticated);
      if (authenticated) {
        console.log('[BOYFANZ Auth] Access token present:', !!fanzSDK.getAccessToken());
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    try {
      await fanzSDK.login();
    } catch (error) {
      console.error('[BOYFANZ Auth] Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fanzSDK.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('[BOYFANZ Auth] Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
