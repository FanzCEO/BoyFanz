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

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect print screen attempts
      if (e.key === 'PrintScreen' && config.showWarning) {
        alert(config.warningMessage);
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
