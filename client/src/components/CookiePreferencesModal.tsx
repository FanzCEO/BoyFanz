import React, { useState } from 'react';
import { useCookieConsent, CookiePreferences } from '@/contexts/CookieConsentContext';
import { X, Cookie, Shield, BarChart3, Target, Cog, Info, Check } from 'lucide-react';

interface CookiePreferencesModalProps {
  onClose: () => void;
}

interface CookieCategory {
  id: keyof CookiePreferences;
  name: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  details: string[];
}

const cookieCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'Required for the website to function properly. Cannot be disabled.',
    icon: <Shield className="w-5 h-5 text-green-500" />,
    required: true,
    details: [
      'Session management and authentication',
      'Security features and fraud prevention',
      'Load balancing and server optimization',
      'Remembering your cookie preferences',
    ],
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'Enable enhanced functionality and personalization.',
    icon: <Cog className="w-5 h-5 text-blue-500" />,
    required: false,
    details: [
      'Remembering your preferences and settings',
      'Language and region preferences',
      'Customized content recommendations',
      'Chat and support features',
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how visitors interact with our website.',
    icon: <BarChart3 className="w-5 h-5 text-purple-500" />,
    required: false,
    details: [
      'Page views and navigation patterns',
      'Performance and error tracking',
      'User experience improvements',
      'Anonymous usage statistics',
    ],
  },
  {
    id: 'advertising',
    name: 'Advertising Cookies',
    description: 'Used to deliver relevant ads and measure their effectiveness.',
    icon: <Target className="w-5 h-5 text-orange-500" />,
    required: false,
    details: [
      'Personalized advertisements',
      'Cross-site tracking for ad targeting',
      'Conversion tracking',
      'Limiting ad frequency',
    ],
  },
];

export function CookiePreferencesModal({ onClose }: CookiePreferencesModalProps) {
  const { preferences, savePreferences, acceptAll, rejectNonEssential } = useCookieConsent();
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleToggle = (categoryId: keyof CookiePreferences) => {
    if (categoryId === 'essential') return; // Cannot toggle essential

    setLocalPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSave = () => {
    savePreferences(localPreferences);
    onClose();
  };

  const handleAcceptAll = () => {
    acceptAll();
    onClose();
  };

  const handleRejectNonEssential = () => {
    rejectNonEssential();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] bg-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Cookie className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cookie Preferences</h2>
              <p className="text-sm text-gray-400">Manage your cookie settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            We use cookies and similar technologies to enhance your browsing experience,
            analyze site traffic, and personalize content. You can choose which categories
            of cookies you want to allow. Note that blocking some types of cookies may
            impact your experience.
          </p>

          {/* Cookie Categories */}
          <div className="space-y-3">
            {cookieCategories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1">
                    {category.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{category.name}</h3>
                        {category.required && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">{category.description}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedCategory(
                        expandedCategory === category.id ? null : category.id
                      )}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Info className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleToggle(category.id)}
                      disabled={category.required}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        localPreferences[category.id]
                          ? 'bg-orange-500'
                          : 'bg-gray-600'
                      } ${category.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          localPreferences[category.id]
                            ? 'translate-x-7'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedCategory === category.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                        What these cookies do:
                      </p>
                      <ul className="space-y-1.5">
                        {category.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                            <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Privacy Policy Link */}
          <p className="text-sm text-gray-500">
            For more information about how we use cookies and your data, please read our{' '}
            <a href="/cookies" className="text-orange-400 hover:text-orange-300 underline">
              Cookie Policy
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-orange-400 hover:text-orange-300 underline">
              Privacy Policy
            </a>.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-900/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRejectNonEssential}
              className="flex-1 px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-lg transition-colors border border-gray-600/50"
            >
              Reject All
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors border border-gray-600"
            >
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookiePreferencesModal;
