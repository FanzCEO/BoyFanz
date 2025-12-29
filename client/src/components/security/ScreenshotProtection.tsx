import React, { useEffect, useCallback, useState, createContext, useContext, ReactNode } from 'react';

interface ScreenshotProtectionConfig {
  enabled: boolean;
  blockRightClick: boolean;
  blockKeyboardShortcuts: boolean;
  detectPrintScreen: boolean;
  detectScreenRecording: boolean;
  blurOnVisibilityChange: boolean;
  logAttempts: boolean;
  apiEndpoint: string;
  platformId: string;
}

interface ProtectionContextType {
  attemptCount: number;
  isBlurred: boolean;
  config: ScreenshotProtectionConfig;
}

const defaultConfig: ScreenshotProtectionConfig = {
  enabled: true,
  blockRightClick: true,
  blockKeyboardShortcuts: true,
  detectPrintScreen: true,
  detectScreenRecording: true,
  blurOnVisibilityChange: true,
  logAttempts: true,
  apiEndpoint: '/api/security/capture-attempt',
  platformId: 'unknown',
};

const ProtectionContext = createContext<ProtectionContextType>({
  attemptCount: 0,
  isBlurred: false,
  config: defaultConfig,
});

export const useScreenshotProtection = () => useContext(ProtectionContext);

interface ScreenshotProtectionProviderProps {
  children: ReactNode;
  config?: Partial<ScreenshotProtectionConfig>;
}

export function ScreenshotProtectionProvider({
  children,
  config: userConfig = {}
}: ScreenshotProtectionProviderProps) {
  const config = { ...defaultConfig, ...userConfig };
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlurred, setIsBlurred] = useState(false);

  const logAttempt = useCallback(async (type: string) => {
    const newCount = attemptCount + 1;
    setAttemptCount(newCount);

    if (config.logAttempts) {
      try {
        await fetch(config.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: config.platformId,
            attemptNumber: newCount,
            type,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          }),
        });
      } catch (error) {
        console.warn('Failed to log capture attempt:', error);
      }
    }

    // Show warning after multiple attempts
    if (newCount >= 3) {
      console.warn(`Content protection: ${newCount} capture attempts detected`);
    }
  }, [attemptCount, config]);

  // Block right-click context menu
  useEffect(() => {
    if (!config.enabled || !config.blockRightClick) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Allow right-click on form inputs
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      e.preventDefault();
      logAttempt('right_click');
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [config.enabled, config.blockRightClick, logAttempt]);

  // Block keyboard shortcuts
  useEffect(() => {
    if (!config.enabled || !config.blockKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect common screenshot shortcuts
      const isScreenshotShortcut =
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) || // Mac screenshots
        (e.ctrlKey && e.key === 'p') || // Print
        (e.ctrlKey && e.shiftKey && e.key === 's') || // Save as
        (e.metaKey && e.key === 's'); // Mac save

      if (isScreenshotShortcut) {
        e.preventDefault();
        logAttempt('keyboard_shortcut');
        return false;
      }

      // Detect dev tools
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
        e.preventDefault();
        logAttempt('dev_tools');
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config.enabled, config.blockKeyboardShortcuts, logAttempt]);

  // Detect PrintScreen key specifically
  useEffect(() => {
    if (!config.enabled || !config.detectPrintScreen) return;

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        // Temporarily blur content
        setIsBlurred(true);
        logAttempt('print_screen');

        // Attempt to clear clipboard (may not work in all browsers)
        navigator.clipboard?.writeText?.('Content protected').catch(() => {});

        setTimeout(() => setIsBlurred(false), 500);
      }
    };

    document.addEventListener('keyup', handleKeyUp);
    return () => document.removeEventListener('keyup', handleKeyUp);
  }, [config.enabled, config.detectPrintScreen, logAttempt]);

  // Blur on tab visibility change (potential screen recording)
  useEffect(() => {
    if (!config.enabled || !config.blurOnVisibilityChange) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        // Small delay before showing content again
        setTimeout(() => setIsBlurred(false), 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [config.enabled, config.blurOnVisibilityChange]);

  // Detect screen recording (limited browser support)
  useEffect(() => {
    if (!config.enabled || !config.detectScreenRecording) return;

    // Check for screen capture API usage
    const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia;
    if (originalGetDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = async function(constraints) {
        logAttempt('screen_recording');
        setIsBlurred(true);
        // Still allow the call but blur content
        return originalGetDisplayMedia.call(navigator.mediaDevices, constraints);
      };
    }

    return () => {
      if (originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    };
  }, [config.enabled, config.detectScreenRecording, logAttempt]);

  // Add CSS to prevent selection and dragging on protected content
  useEffect(() => {
    if (!config.enabled) return;

    const style = document.createElement('style');
    style.id = 'screenshot-protection-styles';
    style.textContent = `
      .protected-content {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      .protected-content img,
      .protected-content video {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      .content-blurred {
        filter: blur(20px) !important;
        transition: filter 0.2s ease-in-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('screenshot-protection-styles');
      if (existingStyle) existingStyle.remove();
    };
  }, [config.enabled]);

  return (
    <ProtectionContext.Provider value={{ attemptCount, isBlurred, config }}>
      <div className={`protected-content ${isBlurred ? 'content-blurred' : ''}`}>
        {children}
      </div>
    </ProtectionContext.Provider>
  );
}

// Component to wrap individual pieces of protected content
interface ProtectedContentProps {
  children: ReactNode;
  className?: string;
}

export function ProtectedContent({ children, className = '' }: ProtectedContentProps) {
  const { isBlurred } = useScreenshotProtection();

  return (
    <div
      className={`protected-content ${isBlurred ? 'content-blurred' : ''} ${className}`}
      onDragStart={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}

// Hook for components that need to know about protection state
export function useProtectionState() {
  const { attemptCount, isBlurred, config } = useScreenshotProtection();
  return { attemptCount, isBlurred, isEnabled: config.enabled };
}

export default ScreenshotProtectionProvider;
