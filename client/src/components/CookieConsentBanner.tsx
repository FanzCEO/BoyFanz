import React from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Cookie, Settings, X } from 'lucide-react';
import { CookiePreferencesModal } from './CookiePreferencesModal';

export function CookieConsentBanner() {
  const {
    showBanner,
    showModal,
    acceptAll,
    rejectNonEssential,
    openModal,
    closeModal,
  } = useCookieConsent();

  if (!showBanner && !showModal) {
    return null;
  }

  return (
    <>
      {/* Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[9998] p-4 md:p-6 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
              {/* Icon and Text */}
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2.5 bg-orange-500/10 rounded-xl flex-shrink-0">
                  <Cookie className="w-6 h-6 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">Cookie Preferences</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    We use cookies and similar technologies to enhance your experience, analyze traffic,
                    and for advertising purposes. By clicking "Accept All", you consent to our use of cookies.
                    You can manage your preferences or reject non-essential cookies.{' '}
                    <a href="/cookies" className="text-orange-400 hover:text-orange-300 underline">
                      Learn more
                    </a>
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={rejectNonEssential}
                  className="flex-1 lg:flex-none px-5 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-lg transition-colors border border-gray-600/50"
                >
                  Reject Non-Essential
                </button>
                <button
                  onClick={openModal}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-lg transition-colors border border-gray-600/50"
                >
                  <Settings className="w-4 h-4" />
                  Manage Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 lg:flex-none px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && <CookiePreferencesModal onClose={closeModal} />}
    </>
  );
}

// Standalone button to open cookie preferences (for footer or settings page)
export function CookiePreferencesButton() {
  const { openModal } = useCookieConsent();

  return (
    <button
      onClick={openModal}
      className="text-sm text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1.5"
    >
      <Cookie className="w-4 h-4" />
      Cookie Preferences
    </button>
  );
}

export default CookieConsentBanner;
