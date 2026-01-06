/**
 * Verification Status Component
 * Shows user's current verification status in a clean, non-intrusive way
 */

import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface VerificationStatusData {
  userId: string;
  ageVerified: boolean;
  identityVerified: boolean;
  has2257Record: boolean;
  record2257Status: string;
  canCreateContent: boolean;
  canPurchaseContent: boolean;
  requiresVerification: boolean;
}

export function VerificationStatus() {
  const { data: status, isLoading } = useQuery<VerificationStatusData>({
    queryKey: ['/api/verification/status'],
    staleTime: 60000, // 1 minute
  });

  if (isLoading || !status) {
    return null;
  }

  // Don't show anything if fully verified
  if (status.ageVerified && !status.requiresVerification) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {status.requiresVerification ? (
            <AlertCircle className="w-5 h-5 text-blue-600" />
          ) : (
            <Clock className="w-5 h-5 text-blue-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {status.requiresVerification
              ? 'Quick Verification Needed'
              : 'Verification Status'}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {status.requiresVerification
              ? 'To subscribe or purchase content, please verify your age (takes less than 60 seconds)'
              : 'Complete verification to unlock all features'}
          </p>

          <div className="space-y-2">
            <VerificationItem
              label="Age Verification"
              verified={status.ageVerified}
              description="Required for all users"
            />

            {status.identityVerified !== undefined && (
              <VerificationItem
                label="Identity Verification"
                verified={status.identityVerified}
                description="Required for creators"
              />
            )}

            {status.has2257Record && (
              <VerificationItem
                label="2257 Compliance"
                verified={status.record2257Status === 'approved'}
                description={getStatusText(status.record2257Status)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationItem({
  label,
  verified,
  description
}: {
  label: string;
  verified: boolean;
  description: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {verified ? (
        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
      <span className={verified ? 'text-green-900' : 'text-gray-600'}>
        {label}
      </span>
      <span className="text-gray-500 text-xs">• {description}</span>
    </div>
  );
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    not_submitted: 'Not submitted',
    pending_review: 'Under review',
    approved: 'Approved',
    rejected: 'Needs revision',
    expired: 'Expired',
  };
  return statusMap[status] || status;
}
