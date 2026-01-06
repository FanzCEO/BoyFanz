import React, { createContext, useContext, useEffect, ReactNode } from 'react';

interface ScreenshotProtectionConfig {
  enabled: boolean;
  blurOnCapture?: boolean;
  showWarning?: boolean;
  warningMessage?: string;
}

interface ScreenshotProtectionContextValue {
  isProtected: boolean;
  config: ScreenshotProtectionConfig;
}

const defaultConfig: ScreenshotProtectionConfig = {
  enabled: false,
  blurOnCapture: false,
  showWarning: false,
  warningMessage: 'Screenshots are not allowed on this page.'
};

const ScreenshotProtectionContext = createContext<ScreenshotProtectionContextValue>({
  isProtected: false,
  config: defaultConfig
});

interface ScreenshotProtectionProviderProps {
  children: ReactNode;
  config?: ScreenshotProtectionConfig;
}

export function ScreenshotProtectionProvider({
  children,
  config = defaultConfig
}: ScreenshotProtectionProviderProps) {
  useEffect(() => {
    if (!config.enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden && config.blurOnCapture) {
        document.body.style.filter = 'blur(10px)';
      } else {
        document.body.style.filter = '';
      }
    };

    const logCaptureAttempt = async (captureType: string) => {
      try {
        const response = await fetch('/api/public/capture-attempt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            captureType,
            pageUrl: window.location.pathname,
            userAgent: navigator.userAgent,
            deviceInfo: {
              platform: navigator.platform,
              language: navigator.language,
              screenWidth: window.screen.width,
              screenHeight: window.screen.height,
            },
          }),
        });

        const data = await response.json();

        // Show warning if server flagged excessive attempts
        if (data.warning) {
          alert(`⚠️ SECURITY WARNING\n\n${data.warning}\n\nAttempt #${data.attemptCount}`);
        }
      } catch (error) {
        console.error('Failed to log capture attempt:', error);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect print screen attempts
      if (e.key === 'PrintScreen') {
        logCaptureAttempt('screenshot');
        if (config.showWarning) {
          alert(config.warningMessage);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.filter = '';
    };
  }, [config]);

  return (
    <ScreenshotProtectionContext.Provider value={{ isProtected: config.enabled, config }}>
      {children}
    </ScreenshotProtectionContext.Provider>
  );
}

export function useScreenshotProtection() {
  return useContext(ScreenshotProtectionContext);
}

export default ScreenshotProtectionProvider;
