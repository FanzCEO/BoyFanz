import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Cookie, Settings, Check } from 'lucide-react';
import { useCSRF } from '@/hooks/useCSRF';

interface ConsentPreferences {
  necessary: boolean; // Always true, cannot be disabled
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export function GDPRConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { csrfToken } = useCSRF();
  
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
    personalization: false
  });

  // Check if consent has already been given
  useEffect(() => {
    // First check localStorage fallback
    const localConsent = localStorage.getItem('gdpr-consent-saved');
    if (localConsent === 'true') {
      setShowBanner(false);
      return;
    }

    const sessionId = getSessionId();

    // Check for existing consent
    fetch(`/api/consent/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.consents || Object.keys(data.consents).length === 0) {
          setShowBanner(true);
        } else {
          // Apply saved preferences
          setPreferences({
            necessary: true,
            functional: data.consents.functional ?? true,
            analytics: data.consents.analytics ?? false,
            marketing: data.consents.marketing ?? false,
            personalization: data.consents.personalization ?? false
          });
          setShowBanner(false);
        }
      })
      .catch(() => {
        // If consent check fails, check localStorage before showing banner
        if (localStorage.getItem('gdpr-consent-saved') === 'true') {
          setShowBanner(false);
        } else {
          setShowBanner(true);
        }
      });
  }, []);

  const getSessionId = () => {
    let sessionId = localStorage.getItem('gdpr-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('gdpr-session-id', sessionId);
    }
    return sessionId;
  };

  const saveConsent = async (consentData: ConsentPreferences) => {
    setIsLoading(true);

    // Safety timeout - ensure loading state doesn't get stuck
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setPreferences(consentData);
      setShowBanner(false);
      setShowDetails(false);
      localStorage.setItem('gdpr-consent-saved', 'true');
      console.log('Consent saved via fallback (timeout)');
    }, 5000);

    try {
      const sessionId = getSessionId();

      // Build headers - CSRF is optional for consent endpoint
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add CSRF token if available (but don't block if not)
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch('/api/consent', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          consents: consentData
        })
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setPreferences(consentData);
        setShowBanner(false);
        setShowDetails(false);
        localStorage.setItem('gdpr-consent-saved', 'true');

        // Apply preferences to page (e.g., load analytics scripts if consented)
        applyConsentPreferences(consentData);
        console.log('Consent preferences saved successfully');
      } else {
        // Even on server error, accept locally to not block the user
        setPreferences(consentData);
        setShowBanner(false);
        setShowDetails(false);
        localStorage.setItem('gdpr-consent-saved', 'true');
        console.warn('Server error saving consent, saved locally');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      // On any error, accept locally to not block the user
      setPreferences(consentData);
      setShowBanner(false);
      setShowDetails(false);
      localStorage.setItem('gdpr-consent-saved', 'true');
      console.warn('Error saving consent, saved locally:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyConsentPreferences = (prefs: ConsentPreferences) => {
    // Apply analytics consent
    if (prefs.analytics) {
      // Load analytics scripts (Google Analytics, etc.)
      console.log('Analytics enabled');
    } else {
      // Disable analytics
      console.log('Analytics disabled');
    }

    // Apply marketing consent  
    if (prefs.marketing) {
      console.log('Marketing cookies enabled');
    } else {
      console.log('Marketing cookies disabled');
    }

    // Apply personalization
    if (prefs.personalization) {
      console.log('Personalization enabled');
    }
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      personalization: true
    });
  };

  const acceptSelected = () => {
    saveConsent(preferences);
  };

  const rejectAll = () => {
    saveConsent({
      necessary: true, // Necessary cookies cannot be disabled
      functional: false,
      analytics: false,
      marketing: false,
      personalization: false
    });
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Consent Banner - Compact */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[99999] bg-card/95 backdrop-blur-sm border-t border-border shadow-lg pointer-events-auto"
        data-testid="gdpr-consent-banner"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Cookie className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground truncate">
                We use cookies for a better experience.{' '}
                <a href="/privacy-policy" className="text-primary hover:underline">
                  Learn more
                </a>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => setShowDetails(true)}
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                data-testid="button-customize-cookies"
              >
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
              <Button
                onClick={rejectAll}
                variant="ghost"
                size="sm"
                disabled={isLoading}
                className="text-xs h-7 px-2"
                data-testid="button-reject-cookies"
              >
                Reject
              </Button>
              <Button
                onClick={acceptAll}
                size="sm"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-xs h-7 px-3"
                data-testid="button-accept-cookies"
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Consent Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-cookie-preferences">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Cookie & Privacy Preferences
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="text-sm text-muted-foreground">
              Manage your cookie and data processing preferences. You can change these settings at any time.
            </div>

            {/* Necessary Cookies */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Necessary Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Essential for basic website functionality and security.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.necessary}
                    disabled={true}
                    aria-label="Necessary cookies (required)"
                  />
                </div>
              </CardHeader>
            </Card>

            {/* Functional Cookies */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Functional Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Remember your preferences and improve user experience.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.functional}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({...prev, functional: checked}))
                    }
                    data-testid="switch-functional-cookies"
                    aria-label="Functional cookies"
                  />
                </div>
              </CardHeader>
            </Card>

            {/* Analytics Cookies */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Analytics Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how you use our site to improve performance.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({...prev, analytics: checked}))
                    }
                    data-testid="switch-analytics-cookies"
                    aria-label="Analytics cookies"
                  />
                </div>
              </CardHeader>
            </Card>

            {/* Marketing Cookies */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Used for targeted advertising and measuring ad effectiveness.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({...prev, marketing: checked}))
                    }
                    data-testid="switch-marketing-cookies"
                    aria-label="Marketing cookies"
                  />
                </div>
              </CardHeader>
            </Card>

            {/* Personalization Cookies */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Personalization Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Customize content and features based on your activity.
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.personalization}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({...prev, personalization: checked}))
                    }
                    data-testid="switch-personalization-cookies"
                    aria-label="Personalization cookies"
                  />
                </div>
              </CardHeader>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={acceptSelected}
                disabled={isLoading}
                className="flex-1"
                data-testid="button-save-preferences"
              >
                Save Preferences
              </Button>
              <Button
                onClick={acceptAll}
                disabled={isLoading}
                variant="outline"
                data-testid="button-accept-all-detailed"
              >
                Accept All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}