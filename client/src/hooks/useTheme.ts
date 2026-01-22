import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

// Hardcoded dungeon theme for boyfanz.fanz.website staging
const BOYFANZ_DUNGEON_THEME = {
  colors: {
    dungeonVoid: '#030406',
    dungeonDeep: '#050810',
    dungeonSmoke: '#0a0e14',
    neonCyan: '#00f6ff',
    neonCyanDim: '#00c4cc',
    neonRed: '#ff1a1a',
    neonRedDim: '#cc1515',
    panelSurface: 'rgba(8, 14, 22, 0.85)',
    bloodDeep: '#3a0808',
  },
  typography: {
    fontDisplay: 'Bebas Neue',
    fontHeading: 'Oswald',
    fontBody: 'Inter',
  },
  effects: {
    neonIntensity: 1,
    glowEnabled: true,
    smokyBackground: true,
    flickerEnabled: true,
  }
};

export function useTheme() {
  const { data: activeTheme } = useQuery({
    queryKey: ['/api/themes/active'],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 60000,
  });

  useEffect(() => {
    // Force dungeon theme on boyfanz staging
    const isBoyFanzStaging = window.location.hostname.includes('boyfanz.fanz.website') || 
                             window.location.hostname.includes('boyfanz');
    
    if (isBoyFanzStaging) {
      console.log('🔥 BoyFanz: Forcing dungeon theme at runtime');
      applyDungeonTheme();
      return;
    }

    if (activeTheme) {
      try {
        applyTheme(activeTheme);
      } catch (error) {
        console.warn('Failed to apply theme:', error);
      }
    }
  }, [activeTheme]);

  return { activeTheme };
}

function applyDungeonTheme() {
  const root = document.documentElement;
  
  // Apply dungeon colors
  Object.entries(BOYFANZ_DUNGEON_THEME.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
    root.style.setProperty(cssVar, value as string);
  });

  // Apply typography
  root.style.setProperty('--font-display', '"Bebas Neue", sans-serif');
  root.style.setProperty('--font-heading', '"Oswald", sans-serif');
  root.style.setProperty('--font-body', '"Inter", sans-serif');

  // Apply body classes for dungeon
  document.body.classList.add('dungeon-section');
  document.body.style.backgroundColor = '#030406';
  document.body.style.color = '#ffffff';

  // Enable effects
  root.classList.remove('glow-disabled', 'smoky-disabled', 'flicker-disabled');
  root.style.setProperty('--neon-intensity', '1');
}

function applyTheme(theme: any) {
  const root = document.documentElement;
  
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
      root.style.setProperty(cssVar, value as string);
    });
  }

  if (theme.typography) {
    root.style.setProperty('--font-display', `"${theme.typography.fontDisplay}", sans-serif`);
    root.style.setProperty('--font-heading', `"${theme.typography.fontHeading}", sans-serif`);
    root.style.setProperty('--font-body', `"${theme.typography.fontBody}", sans-serif`);
  }

  if (theme.effects) {
    if (theme.effects.neonIntensity !== undefined) {
      root.style.setProperty('--neon-intensity', theme.effects.neonIntensity.toString());
    }
    root.classList.toggle('glow-disabled', !theme.effects.glowEnabled);
    root.classList.toggle('smoky-disabled', !theme.effects.smokyBackground);
    root.classList.toggle('flicker-disabled', !theme.effects.flickerEnabled);
  }
}
