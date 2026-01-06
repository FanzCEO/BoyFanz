import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'boyfanz-theme-preference';

export function useDarkMode() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored && ['dark', 'light', 'system'].includes(stored)) {
        return stored;
      }
    }
    return 'dark'; // Default to dark for fight ring aesthetic
  });

  const [isDark, setIsDark] = useState(true);

  // Get system preference
  const getSystemTheme = useCallback((): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
    setIsDark(dark);
  }, []);

  // Set theme and persist
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);

    if (newTheme === 'system') {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(newTheme === 'dark');
    }
  }, [applyTheme, getSystemTheme]);

  // Toggle between dark and light
  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  }, [isDark, setTheme]);

  // Initialize and listen for system preference changes
  useEffect(() => {
    // Apply initial theme
    if (theme === 'system') {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(theme === 'dark');
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme, getSystemTheme]);

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
}
