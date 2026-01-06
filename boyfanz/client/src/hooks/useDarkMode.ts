import { useState, useEffect, useCallback } from 'react';

// BoyFanz Theme Modes
// Dungeon = Default immersive dark neon experience
// Night = Softer dark mode for extended use
// Clean = Admin/testing only (light mode)
export type ThemeMode = 'dungeon' | 'night' | 'clean';

const STORAGE_KEY = 'boyfanz-theme-mode';

export function useDarkMode() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored && ['dungeon', 'night', 'clean'].includes(stored)) {
        return stored;
      }
    }
    return 'dungeon'; // LOCKED DEFAULT: Dungeon mode
  });

  const [isDark, setIsDark] = useState(true);

  // Apply theme to document
  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes first
    root.classList.remove('dungeon', 'night', 'clean', 'light');
    body.classList.remove('dungeon-section', 'night-section', 'clean-section');
    
    switch (mode) {
      case 'dungeon':
        root.classList.add('dungeon');
        body.classList.add('dungeon-section');
        body.style.backgroundColor = '#030406';
        body.style.color = '#ffffff';
        setIsDark(true);
        break;
      case 'night':
        root.classList.add('night');
        body.classList.add('night-section');
        body.style.backgroundColor = '#0a0a0f';
        body.style.color = '#e0e0e0';
        setIsDark(true);
        break;
      case 'clean':
        root.classList.add('clean', 'light');
        body.classList.add('clean-section');
        body.style.backgroundColor = '#ffffff';
        body.style.color = '#1a1a1a';
        setIsDark(false);
        break;
    }
  }, []);

  // Set theme and persist
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Cycle through themes: dungeon -> night -> clean -> dungeon
  const toggleTheme = useCallback(() => {
    const order: ThemeMode[] = ['dungeon', 'night', 'clean'];
    const currentIndex = order.indexOf(theme);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
  }, [theme, setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    isDungeon: theme === 'dungeon',
    isNight: theme === 'night',
    isClean: theme === 'clean',
  };
}
