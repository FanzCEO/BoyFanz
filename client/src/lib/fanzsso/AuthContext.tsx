/**
 * FanzSSO Auth Context
 *
 * React context provider for authentication state.
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import { useAuth, type UseAuthOptions, type UseAuthReturn } from './useAuth';

// Create context with undefined default
const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

export interface AuthProviderProps extends UseAuthOptions {
  children: ReactNode;
}

/**
 * FanzSSO Auth Provider
 *
 * Wraps your app to provide authentication state via context.
 *
 * @example
 * ```tsx
 * <AuthProvider autoFetch includeEntitlements>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({
  children,
  ...options
}: AuthProviderProps): React.ReactElement {
  const auth = useAuth(options);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 *
 * Must be used within an AuthProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, logout } = useAuthContext();
 *   // ...
 * }
 * ```
 */
export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

export default AuthProvider;
