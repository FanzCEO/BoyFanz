/**
 * Verification Dashboard
 * Centralized page for all verification needs
 * Does NOT modify the landing page - this is a separate page
 */

import { useQuery } from '@tanstack/react-query';
import { Shield, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { VerificationStatus } from '../components/verification/VerificationStatus';
import { IdentityVerificationFlow } from '../components/verification/IdentityVerificationFlow';
import { Form2257 } from '../components/verification/Form2257';
import { AgeVerificationModal } from '../components/verification/AgeVerificationModal';
import { useState } from 'react';

export default function VerificationDashboard() {
  const [showAgeModal, setShowAgeModal] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ['/api/verification/status'],
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Verification Center
              </h1>
              <p className="text-sm text-gray-600">
                Complete your verification to unlock all features
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Status Overview */}
        <VerificationStatus />

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Verification Steps
          </h2>

          <div className="space-y-4">
            {/* Step 1: Age Verification */}
            <VerificationStep
              stepNumber={1}
              title="Age Verification"
              description="Quick verification using age estimation technology"
              status={status?.ageVerified ? 'completed' : 'pending'}
              estimatedTime="60 seconds"
              action={
                !status?.ageVerified ? (
                  <button
                    onClick={() => setShowAgeModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    Start Verification
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null
              }
            />

            {/* Step 2: Identity Verification (Creators Only) */}
            {status && (
              <VerificationStep
                stepNumber={2}
                title="Identity Verification"
                description="For creators - secure ID verification"
                status={
                  status.identityVerified
                    ? 'completed'
                    : status.ageVerified
                    ? 'pending'
                    : 'locked'
                }
                estimatedTime="2-3 minutes"
                requiredFor="Creator Access"
              />
            )}

            {/* Step 3: 2257 Record (Creators Only) */}
            {status && (
              <VerificationStep
                stepNumber={3}
                title="2257 Compliance Record"
                description="Required legal documentation for content creators"
                status={
                  status.record2257Status === 'approved'
                    ? 'completed'
                    : status.identityVerified
                    ? 'pending'
                    : 'locked'
                }
                estimatedTime="3-5 minutes"
                requiredFor="Content Creation"
              />
            )}
          </div>
        </div>

        {/* Age Verification Section */}
        {!status?.ageVerified && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Start with Age Verification
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              This quick verification is required for all users and takes less than 60
              seconds.
            </p>
            <button
              onClick={() => setShowAgeModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Verify My Age Now
            </button>
          </div>
        )}

        {/* Identity Verification Section */}
        {status?.ageVerified && !status?.identityVerified && (
          <div className="mb-6">
            <IdentityVerificationFlow />
          </div>
        )}

        {/* 2257 Form Section */}
        {status?.identityVerified && status?.record2257Status !== 'approved' && (
          <div className="mb-6">
            <Form2257 />
          </div>
        )}

        {/* All Complete */}
        {status?.canCreateContent && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              All Set! 🎉
            </h2>
            <p className="text-green-700 mb-6">
              You've completed all verification requirements. You can now create and
              monetize content on the platform.
            </p>
            <a
              href="/creator/dashboard"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Go to Creator Dashboard
            </a>
          </div>
        )}
      </div>

      {/* Age Verification Modal */}
      <AgeVerificationModal
        isOpen={showAgeModal}
        onClose={() => setShowAgeModal(false)}
      />
    </div>
  );
}

interface VerificationStepProps {
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'locked';
  estimatedTime: string;
  requiredFor?: string;
  action?: React.ReactNode;
}

function VerificationStep({
  stepNumber,
  title,
  description,
  status,
  estimatedTime,
  requiredFor,
  action,
}: VerificationStepProps) {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg border ${
        status === 'completed'
          ? 'bg-green-50 border-green-200'
          : status === 'pending'
          ? 'bg-white border-gray-200'
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      {/* Step Number / Status Icon */}
      <div className="flex-shrink-0">
        {status === 'completed' ? (
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
        ) : status === 'pending' ? (
          <div className="w-10 h-10 bg-blue-100 border-2 border-blue-600 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">{stepNumber}</span>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500 font-bold">{stepNumber}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-2">{description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {estimatedTime}
              </span>
              {requiredFor && (
                <>
                  <span>•</span>
                  <span>{requiredFor}</span>
                </>
              )}
            </div>
          </div>

          {/* Action Button */}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}
