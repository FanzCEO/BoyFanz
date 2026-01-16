import React, { useState } from 'react';
import { useAgeVerification } from '@/contexts/AgeVerificationContext';
import { Shield, AlertTriangle, ExternalLink, Lock } from 'lucide-react';

interface AgeVerificationGateProps {
  children: React.ReactNode;
}

export function AgeVerificationGate({ children }: AgeVerificationGateProps) {
  const { isVerified, isLoading, initiateVerification, setVerified } = useAgeVerification();
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white/70">Verifying age status...</p>
        </div>
      </div>
    );
  }

  // If verified, show the app
  if (isVerified) {
    return <>{children}</>;
  }

  const handleVerifyMyClick = async () => {
    setIsInitiating(true);
    try {
      await initiateVerification();
    } finally {
      setIsInitiating(false);
    }
  };

  const handleSelfDeclaration = () => {
    setVerified('self-declaration');
  };

  // Show age gate
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Age Verification Required</h1>
          <p className="text-white/80 text-sm">
            This website contains adult content
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200/90">
              <p className="font-semibold mb-1">18+ Content Warning</p>
              <p>
                BoyFanz contains adult content intended for individuals 18 years of age or older.
                By entering, you confirm you are of legal age in your jurisdiction.
              </p>
            </div>
          </div>

          {!showDeclaration ? (
            <>
              {/* VerifyMy Button */}
              <button
                onClick={handleVerifyMyClick}
                disabled={isInitiating}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInitiating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Connecting to VerifyMy...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Verify with VerifyMy
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-800 text-gray-500">or</span>
                </div>
              </div>

              {/* Self Declaration Option */}
              <button
                onClick={() => setShowDeclaration(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200 border border-gray-600/50"
              >
                I am 18+ years old - Enter Site
              </button>
            </>
          ) : (
            <>
              {/* Self Declaration Form */}
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  By clicking "Confirm & Enter", you certify that:
                </p>
                <ul className="text-sm text-gray-400 space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    You are at least 18 years old (or the age of majority in your jurisdiction)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    Adult content is legal in your jurisdiction
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    You consent to viewing adult material
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    You agree to our{' '}
                    <a href="/terms" target="_blank" className="text-orange-400 hover:underline">
                      Terms of Service
                    </a>
                  </li>
                </ul>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDeclaration(false)}
                    className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSelfDeclaration}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
                  >
                    Confirm & Enter
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Exit Link */}
          <div className="text-center">
            <a
              href="https://google.com"
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              I am under 18 - Exit this site
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 text-center">
            This site complies with 18 U.S.C. § 2257 Record-Keeping Requirements.
            <br />
            <a href="/2257" className="text-orange-400/70 hover:text-orange-400">
              View 2257 Statement
            </a>
            {' | '}
            <a href="/dmca" className="text-orange-400/70 hover:text-orange-400">
              DMCA Policy
            </a>
            {' | '}
            <a href="/privacy" className="text-orange-400/70 hover:text-orange-400">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AgeVerificationGate;
