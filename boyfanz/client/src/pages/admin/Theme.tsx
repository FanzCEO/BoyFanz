import React from 'react';
import ThemeManagementDashboard from '@/components/admin/ThemeManagementDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function ThemePage() {
  const { user, isAdmin } = useAuth();
  
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  const handleSave = async (theme: any) => {
    try {
      const response = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(theme),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save theme');
      }
      
      // Reload the page to apply new theme
      window.location.reload();
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  };
  
  return (
    <ThemeManagementDashboard
      platformId={window.location.hostname.split('.')[0]}
      platformName={document.title}
      currentTheme={getCurrentTheme()}
      onSave={handleSave}
    />
  );
}

// Helper to get current theme from CSS variables
function getCurrentTheme() {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  
  return {
    colors: {
      background: style.getPropertyValue('--background').trim(),
      foreground: style.getPropertyValue('--foreground').trim(),
      card: style.getPropertyValue('--card').trim(),
      cardForeground: style.getPropertyValue('--card-foreground').trim(),
      popover: style.getPropertyValue('--popover').trim(),
      popoverForeground: style.getPropertyValue('--popover-foreground').trim(),
      primary: style.getPropertyValue('--primary').trim(),
      primaryForeground: style.getPropertyValue('--primary-foreground').trim(),
      secondary: style.getPropertyValue('--secondary').trim(),
      secondaryForeground: style.getPropertyValue('--secondary-foreground').trim(),
      muted: style.getPropertyValue('--muted').trim(),
      mutedForeground: style.getPropertyValue('--muted-foreground').trim(),
      accent: style.getPropertyValue('--accent').trim(),
      accentForeground: style.getPropertyValue('--accent-foreground').trim(),
      destructive: style.getPropertyValue('--destructive').trim(),
      destructiveForeground: style.getPropertyValue('--destructive-foreground').trim(),
      border: style.getPropertyValue('--border').trim(),
      input: style.getPropertyValue('--input').trim(),
      ring: style.getPropertyValue('--ring').trim(),
    },
    typography: {
      fontDisplay: style.getPropertyValue('--font-display').trim() || "'Inter', sans-serif",
      fontSans: style.getPropertyValue('--font-sans').trim() || "'Inter', sans-serif",
      fontSerif: style.getPropertyValue('--font-serif').trim() || "Georgia, serif",
      fontMono: style.getPropertyValue('--font-mono').trim() || "Menlo, monospace",
      fontSizeBase: parseInt(style.fontSize) || 16,
      lineHeightBase: parseFloat(style.lineHeight) || 1.5,
      letterSpacingTight: -0.02,
      letterSpacingNormal: 0,
      letterSpacingWide: 0.05,
    },
    layout: {
      borderRadius: parseFloat(style.getPropertyValue('--radius').trim()) || 0.5,
      containerMaxWidth: '1280px',
      sidebarWidth: '280px',
      headerHeight: '64px',
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
    },
    effects: {
      neonGlowIntensity: 60,
      neonGlowSpread: 20,
      neonGlowColor1: style.getPropertyValue('--primary').trim(),
      neonGlowColor2: style.getPropertyValue('--secondary').trim(),
      neonGlowColor3: style.getPropertyValue('--accent').trim(),
      textShadowIntensity: 70,
      enableFlicker: true,
      flickerSpeed: 3,
      enablePulse: true,
      pulseSpeed: 2,
      glowBlur: 24,
      glowOpacity: 40,
    },
    animations: {
      transitionSpeed: 'normal',
      easing: 'ease-in-out',
      enableHoverEffects: true,
      enableFocusEffects: true,
      enableLoadingAnimations: true,
      buttonHoverLift: 2,
      buttonHoverScale: 1.02,
    },
    mode: {
      defaultMode: 'dark' as const,
      allowUserToggle: true,
    },
    accessibility: {
      highContrastMode: false,
      reducedMotion: false,
      largeText: false,
      focusIndicatorWidth: 2,
      focusIndicatorColor: style.getPropertyValue('--primary').trim(),
      colorBlindMode: 'none' as const,
    },
    customCSS: '',
  };
}
