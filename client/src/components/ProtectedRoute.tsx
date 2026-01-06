/**
 * BOYFANZ Protected Route Component
 *
 * Wrapper for routes that require authentication
 * Redirects to login if not authenticated
 */

import { useLocation, Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen bg-boy-bg-primary flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-boy-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the attempted location
    return <Redirect to={`/login?returnTo=${encodeURIComponent(location)}`} />;
  }

  return <>{children}</>;
}
