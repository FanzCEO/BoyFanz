import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
}

interface CookieConsentState {
  consentGiven: boolean;
  preferences: CookiePreferences;
  showBanner: boolean;
  showModal: boolean;
  consentTimestamp: Date | null;
}

interface CookieConsentContextType extends CookieConsentState {
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
  openModal: () => void;
  closeModal: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = 'boyfanz_cookie_consent';
const COOKIE_CONSENT_EXPIRY_DAYS = 365;

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  advertising: false,
};

const allAcceptedPreferences: CookiePreferences = {
  essential: true,
  functional: true,
  analytics: true,
  advertising: true,
};

interface CookieConsentProviderProps {
  children: ReactNode;
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [state, setState] = useState<CookieConsentState>({
    consentGiven: false,
    preferences: defaultPreferences,
    showBanner: false,
    showModal: false,
    consentTimestamp: null,
  });

  // Check for existing consent on mount
  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);

    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        const timestamp = new Date(parsed.timestamp);
        const expiryDate = new Date(timestamp);
        expiryDate.setDate(expiryDate.getDate() + COOKIE_CONSENT_EXPIRY_DAYS);

        if (new Date() < expiryDate) {
          setState({
            consentGiven: true,
            preferences: parsed.preferences,
            showBanner: false,
            showModal: false,
            consentTimestamp: timestamp,
          });

          // Apply preferences
          applyPreferences(parsed.preferences);
          return;
        } else {
          // Expired consent
          localStorage.removeItem(COOKIE_CONSENT_KEY);
        }
      } catch (e) {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
      }
    }

    // No valid consent, show banner
    setState(prev => ({ ...prev, showBanner: true }));
  }, []);

  const applyPreferences = useCallback((preferences: CookiePreferences) => {
    // Apply analytics tracking based on preference
    if (preferences.analytics) {
      // Enable analytics (Google Analytics, etc.)
      window.dispatchEvent(new CustomEvent('cookieConsent:analytics', { detail: true }));
    } else {
      window.dispatchEvent(new CustomEvent('cookieConsent:analytics', { detail: false }));
    }

    // Apply advertising tracking based on preference
    if (preferences.advertising) {
      window.dispatchEvent(new CustomEvent('cookieConsent:advertising', { detail: true }));
    } else {
      window.dispatchEvent(new CustomEvent('cookieConsent:advertising', { detail: false }));
    }

    // Apply functional cookies based on preference
    if (preferences.functional) {
      window.dispatchEvent(new CustomEvent('cookieConsent:functional', { detail: true }));
    } else {
      window.dispatchEvent(new CustomEvent('cookieConsent:functional', { detail: false }));
    }
  }, []);

  const saveToStorage = useCallback((preferences: CookiePreferences) => {
    const timestamp = new Date();
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      preferences,
      timestamp: timestamp.toISOString(),
    }));

    // Also save to server for GDPR compliance
    fetch('/api/consent/save', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preferences,
        timestamp: timestamp.toISOString(),
        userAgent: navigator.userAgent,
      }),
    }).catch(console.error);

    return timestamp;
  }, []);

  const acceptAll = useCallback(() => {
    const timestamp = saveToStorage(allAcceptedPreferences);
    applyPreferences(allAcceptedPreferences);

    setState({
      consentGiven: true,
      preferences: allAcceptedPreferences,
      showBanner: false,
      showModal: false,
      consentTimestamp: timestamp,
    });
  }, [saveToStorage, applyPreferences]);

  const rejectNonEssential = useCallback(() => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      advertising: false,
    };

    const timestamp = saveToStorage(essentialOnly);
    applyPreferences(essentialOnly);

    setState({
      consentGiven: true,
      preferences: essentialOnly,
      showBanner: false,
      showModal: false,
      consentTimestamp: timestamp,
    });
  }, [saveToStorage, applyPreferences]);

  const savePreferences = useCallback((preferences: CookiePreferences) => {
    // Ensure essential is always true
    const finalPreferences = { ...preferences, essential: true };
    const timestamp = saveToStorage(finalPreferences);
    applyPreferences(finalPreferences);

    setState({
      consentGiven: true,
      preferences: finalPreferences,
      showBanner: false,
      showModal: false,
      consentTimestamp: timestamp,
    });
  }, [saveToStorage, applyPreferences]);

  const openModal = useCallback(() => {
    setState(prev => ({ ...prev, showModal: true }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({ ...prev, showModal: false }));
  }, []);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setState({
      consentGiven: false,
      preferences: defaultPreferences,
      showBanner: true,
      showModal: false,
      consentTimestamp: null,
    });
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        ...state,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        openModal,
        closeModal,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}

export default CookieConsentContext;
