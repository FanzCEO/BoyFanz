/**
 * Auth Error Page
 *
 * Displays authentication errors from FanzSSO or local auth failures.
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AlertCircle } from 'lucide-react';

export default function AuthError() {
  const [location, setLocation] = useLocation();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error') || 'unknown_error';
    const description = params.get('error_description');

    // Map error codes to user-friendly messages
    const errorMessages: Record<string, { title: string; details: string }> = {
      invalid_request: {
        title: 'Invalid Authentication Request',
        details: description || 'The authentication request was invalid. This may be a configuration issue.',
      },
      invalid_state: {
        title: 'Security Validation Failed',
        details: 'The authentication request failed security validation. Please try again.',
      },
      no_code: {
        title: 'Authorization Failed',
        details: 'No authorization code was received from the authentication server.',
      },
      invalid_token: {
        title: 'Invalid Token',
        details: 'The authentication token could not be verified.',
      },
      callback_failed: {
        title: 'Authentication Callback Failed',
        details: 'An error occurred while processing the authentication response.',
      },
      session_save_failed: {
        title: 'Session Error',
        details: 'Your session could not be saved. Please try logging in again.',
      },
      access_denied: {
        title: 'Access Denied',
        details: description || 'You do not have permission to access this application.',
      },
      server_error: {
        title: 'Server Error',
        details: description || 'An error occurred on the authentication server.',
      },
      unknown_error: {
        title: 'Authentication Error',
        details: description || 'An unexpected error occurred during authentication.',
      },
    };

    const errorInfo = errorMessages[error] || errorMessages.unknown_error;
    setErrorMessage(errorInfo.title);
    setErrorDetails(errorInfo.details);

    // Auto-redirect to login after 10 seconds
    const timeout = setTimeout(() => {
      setLocation('/auth/login', { replace: true });
    }, 10000);

    return () => clearTimeout(timeout);
  }, [location, navigate]);

  const handleRetry = () => {
    setLocation('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-lg p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full bg-red-500/10 p-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-3">
            {errorMessage}
          </h1>

          <p className="text-gray-300 text-center mb-6">
            {errorDetails}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>

            <button
              onClick={() => setLocation('/')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Go to Homepage
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center mt-6">
            Redirecting to login in 10 seconds...
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Need help?{' '}
            <a href="/support" className="text-cyan-400 hover:text-cyan-300 underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
