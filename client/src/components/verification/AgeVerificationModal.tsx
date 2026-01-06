/**
 * Age Verification Modal
 * Smooth, non-invasive modal for age verification
 * Only appears when user tries to subscribe/purchase
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Shield, Clock, CheckCircle } from 'lucide-react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AgeVerificationResponse {
  success: boolean;
  sessionId: string;
  verificationUrl: string;
  expiresAt: string;
  message: string;
  estimatedTime: string;
  instructions: string;
}

export function AgeVerificationModal({
  isOpen,
  onClose,
  onSuccess,
}: AgeVerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const queryClient = useQueryClient();

  const initiateVerification = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/verification/age/initiate', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to initiate verification');
      return response.json() as Promise<AgeVerificationResponse>;
    },
    onSuccess: (data) => {
      // Open VerifyMy in new window
      const verifyWindow = window.open(
        data.verificationUrl,
        'age-verification',
        'width=600,height=800,scrollbars=yes'
      );

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch('/api/verification/status', {
            credentials: 'include',
          });
          const status = await statusResponse.json();

          if (status.ageVerified) {
            clearInterval(pollInterval);
            if (verifyWindow && !verifyWindow.closed) {
              verifyWindow.close();
            }
            queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
            setIsVerifying(false);
            onSuccess?.();
            onClose();
          }
        } catch (error) {
          console.error('Verification polling error:', error);
        }
      }, 3000); // Poll every 3 seconds

      // Stop polling after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsVerifying(false);
      }, 600000);

      setIsVerifying(true);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Unlock Premium Content</h2>
              <p className="text-blue-100 text-sm">Quick verification. Full access.</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {!isVerifying ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Takes less than 60 seconds</span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Get instant access in 3 steps:
                  </h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="font-semibold text-blue-600">1.</span>
                      Click "Get Access Now" below
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-blue-600">2.</span>
                      Quick selfie verification (60 seconds)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-blue-600">3.</span>
                      Unlock exclusive content immediately
                    </li>
                  </ol>
                </div>

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Military-grade encryption keeps your data secure</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>No awkward questions. Just quick tech.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Verify once, access forever</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Not Yet
                </button>
                <button
                  onClick={() => initiateVerification.mutate()}
                  disabled={initiateVerification.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
                >
                  {initiateVerification.isPending ? 'Opening...' : 'Get Access Now'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verification In Progress
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete the verification in the popup window
              </p>
              <p className="text-xs text-gray-500">
                This window will close automatically when you're done
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
