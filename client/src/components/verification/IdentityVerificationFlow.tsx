/**
 * Identity Verification Flow
 * For creators who need to complete identity verification
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, Lock, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface IdentityVerificationResponse {
  success: boolean;
  sessionId: string;
  verificationUrl: string;
  expiresAt: string;
  message: string;
  estimatedTime: string;
  instructions: string;
  securityNote: string;
}

export function IdentityVerificationFlow() {
  const [isVerifying, setIsVerifying] = useState(false);
  const queryClient = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ['/api/verification/status'],
    staleTime: 60000,
  });

  const initiateVerification = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/verification/identity/initiate', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initiate verification');
      }

      return response.json() as Promise<IdentityVerificationResponse>;
    },
    onSuccess: (data) => {
      // Open VerifyMy ID in new window
      const verifyWindow = window.open(
        data.verificationUrl,
        'identity-verification',
        'width=700,height=900,scrollbars=yes'
      );

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch('/api/verification/status', {
            credentials: 'include',
          });
          const status = await statusResponse.json();

          if (status.identityVerified) {
            clearInterval(pollInterval);
            if (verifyWindow && !verifyWindow.closed) {
              verifyWindow.close();
            }
            queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
            setIsVerifying(false);
          }
        } catch (error) {
          console.error('Verification polling error:', error);
        }
      }, 3000);

      // Stop polling after 15 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsVerifying(false);
      }, 900000);

      setIsVerifying(true);
    },
  });

  // Already verified
  if (status?.identityVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              Identity Verified
            </h3>
            <p className="text-sm text-green-700">
              Your identity has been successfully verified. You can now proceed
              with creator setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Need age verification first
  if (!status?.ageVerified) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">
              Age Verification Required First
            </h3>
            <p className="text-sm text-yellow-700">
              Please complete age verification before proceeding with identity
              verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">Start Earning. Verify Your Identity.</h2>
            <p className="text-indigo-100 text-sm">One step closer to getting paid</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!isVerifying ? (
          <>
            <div className="mb-6">
              {/* Value Prop */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800 mb-1">
                    Keep 100% of Your Earnings
                  </div>
                  <p className="text-sm text-green-700">
                    Unlike OnlyFans, FANZ puts creators first. Fans pay the fees.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Clock className="w-4 h-4" />
                <span>Takes 2-3 minutes • Required for 2257 compliance</span>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  What you'll need:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    Government-issued photo ID (passport or driver's license)
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    Clear, well-lit environment for selfie
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    2-3 minutes of your time
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2 mb-2">
                  <Lock className="w-4 h-4 text-gray-600 mt-0.5" />
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Your Security & Privacy
                  </h4>
                </div>
                <ul className="space-y-1 text-xs text-gray-600 ml-6">
                  <li>• All documents are encrypted end-to-end</li>
                  <li>• Stored in highly secure, access-controlled environment</li>
                  <li>• Only accessible to authorized compliance administrators</li>
                  <li>• Required for 2257 compliance and creator protection</li>
                  <li>• Never shared with third parties</li>
                </ul>
              </div>

              {initiateVerification.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700">
                    {initiateVerification.error?.message ||
                      'Failed to initiate verification. Please try again.'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => initiateVerification.mutate()}
              disabled={initiateVerification.isPending}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {initiateVerification.isPending ? (
                'Opening verification...'
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify & Start Earning
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Once verified, you can start posting content and getting paid immediately
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verification In Progress
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Complete the identity verification in the popup window
            </p>
            <p className="text-xs text-gray-500">
              This may take 2-3 minutes. Please don't close this window.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
