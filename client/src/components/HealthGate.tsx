/**
 * HealthGate Component
 *
 * PURPOSE: Prevent "empty but successful" UI states by gating on core API health
 * RULE: If critical APIs fail, show explicit error - never render empty content
 */

import { useEffect, useState, ReactNode } from 'react';

interface HealthStatus {
  healthy: boolean;
  checking: boolean;
  errors: string[];
  lastCheck: Date | null;
}

interface HealthGateProps {
  children: ReactNode;
  /** Which APIs must be reachable for the app to function */
  requiredEndpoints?: string[];
  /** Retry interval in ms (default: 10000) */
  retryInterval?: number;
  /** Max retries before showing persistent error (default: 3) */
  maxRetries?: number;
}

const DEFAULT_REQUIRED_ENDPOINTS = [
  '/api/health',
  '/api/auth/me',
];

export function HealthGate({
  children,
  requiredEndpoints = DEFAULT_REQUIRED_ENDPOINTS,
  retryInterval = 10000,
  maxRetries = 3,
}: HealthGateProps) {
  const [status, setStatus] = useState<HealthStatus>({
    healthy: false,
    checking: true,
    errors: [],
    lastCheck: null,
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const checkHealth = async () => {
      if (!mounted) return;

      setStatus(prev => ({ ...prev, checking: true }));
      const errors: string[] = [];

      for (const endpoint of requiredEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: endpoint.includes('/auth/') ? 'GET' : 'HEAD',
            credentials: 'include',
            headers: { 'Accept': 'application/json' },
          });

          // 401 on /auth/me is OK (user not logged in)
          // But 404/500 means API is broken
          if (response.status === 404) {
            errors.push(`${endpoint}: Not Found (404) - API may not exist`);
          } else if (response.status >= 500) {
            errors.push(`${endpoint}: Server Error (${response.status})`);
          } else if (!response.ok && response.status !== 401) {
            errors.push(`${endpoint}: Failed (${response.status})`);
          }
        } catch (error) {
          errors.push(`${endpoint}: Network Error - Cannot reach server`);
        }
      }

      if (!mounted) return;

      const healthy = errors.length === 0;
      setStatus({
        healthy,
        checking: false,
        errors,
        lastCheck: new Date(),
      });

      // If unhealthy and haven't exceeded retries, schedule retry
      if (!healthy && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        retryTimeout = setTimeout(checkHealth, retryInterval);
      }
    };

    checkHealth();

    return () => {
      mounted = false;
      clearTimeout(retryTimeout);
    };
  }, [requiredEndpoints, retryInterval, maxRetries, retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    setStatus(prev => ({ ...prev, checking: true }));
  };

  // Still checking initial health
  if (status.checking && status.lastCheck === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4" />
          <p className="text-gray-400">Connecting to BoyFanz...</p>
        </div>
      </div>
    );
  }

  // Health check failed
  if (!status.healthy && !status.checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 border border-red-500/30">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Connection Issue</h1>
            <p className="text-gray-400 text-sm">
              We're having trouble connecting to BoyFanz. This could be a temporary issue.
            </p>
          </div>

          <div className="bg-gray-900 rounded p-4 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Technical Details</p>
            <ul className="space-y-1">
              {status.errors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-400 font-mono">
                  {error}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>

          <p className="text-center text-gray-500 text-xs mt-4">
            If this persists, please contact support.
          </p>
        </div>
      </div>
    );
  }

  // Healthy - render children
  return <>{children}</>;
}

/**
 * Hook for checking API health imperatively
 */
export function useHealthCheck(endpoint: string) {
  const [status, setStatus] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown');
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok || response.status === 401) {
        setStatus('healthy');
        setError(null);
      } else {
        setStatus('unhealthy');
        setError(`HTTP ${response.status}`);
      }
    } catch (e) {
      setStatus('unhealthy');
      setError('Network error');
    }
  };

  return { status, error, check };
}

export default HealthGate;
