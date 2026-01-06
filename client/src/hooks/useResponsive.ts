/**
 * MOBILE RESPONSIVE HOOK
 *
 * React hook for responsive design
 * - Auto-updates on screen size changes
 * - Provides device capabilities
 * - Zero quality/feature loss across devices
 */

import { useState, useEffect } from 'react';
import { getResponsiveOptimizer, type DeviceCapabilities } from '../lib/responsiveOptimizer';

export function useResponsive() {
  const optimizer = getResponsiveOptimizer();
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(
    optimizer.getCapabilities()
  );

  useEffect(() => {
    // Subscribe to capability changes
    const unsubscribe = optimizer.onChange((newCapabilities) => {
      setCapabilities(newCapabilities);
    });

    return unsubscribe;
  }, [optimizer]);

  return {
    // Device info
    isMobile: capabilities.screenSize === 'mobile',
    isTablet: capabilities.screenSize === 'tablet',
    isDesktop: capabilities.screenSize === 'desktop' || capabilities.screenSize === 'large',
    isLargeScreen: capabilities.screenSize === 'large',

    // Orientation
    isPortrait: capabilities.orientation === 'portrait',
    isLandscape: capabilities.orientation === 'landscape',

    // Display
    isRetina: capabilities.pixelRatio >= 2,
    pixelRatio: capabilities.pixelRatio,

    // Interaction
    isTouchDevice: capabilities.touchEnabled,
    touchTargetSize: optimizer.getTouchTargetSize(),

    // Network
    connectionSpeed: capabilities.connectionSpeed,
    isFastConnection: capabilities.connectionSpeed === 'fast',
    isSlowConnection: capabilities.connectionSpeed === 'slow',

    // User preferences
    prefersReducedMotion: capabilities.reducedMotion,
    prefersDarkMode: capabilities.darkMode,

    // Utilities
    getOptimalImageSize: () => optimizer.getOptimalImageSize(),
    getOptimalVideoQuality: () => optimizer.getOptimalVideoQuality(),
    shouldEnableFeature: (feature: string) => optimizer.shouldEnableFeature(feature),
    getFontScale: () => optimizer.getFontScale(),

    // Full capabilities
    capabilities,
  };
}

// Breakpoint hook
export function useBreakpoint(breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const breakpoints = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    };

    const query = window.matchMedia(`(min-width: ${breakpoints[breakpoint]})`);
    setMatches(query.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    query.addEventListener('change', handler);

    return () => query.removeEventListener('change', handler);
  }, [breakpoint]);

  return matches;
}

export default useResponsive;
