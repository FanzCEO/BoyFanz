import { useEffect } from 'react';

// Common keyboard shortcuts hook for accessibility
export function useCommonShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip navigation shortcut (Alt + S)
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        const mainContent = document.querySelector('main, [role="main"]');
        if (mainContent instanceof HTMLElement) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Help shortcut (Alt + H)
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.location.href = '/help';
      }

      // Home shortcut (Alt + Home)
      if (e.altKey && e.key === 'Home') {
        e.preventDefault();
        window.location.href = '/';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}

export default useCommonShortcuts;
