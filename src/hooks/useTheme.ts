import { useCallback, useEffect, useState } from 'react';

// Hook to manage theme attribute on the <html> element.
// Usage: const [theme, setTheme] = useTheme(initial);

export default function useTheme(initialTheme?: string) {
  const [theme, setThemeState] = useState<string>(initialTheme || 'light');

  const applyTheme = useCallback((t: string) => {
    try {
      const html = document.documentElement;

      if (html) {
        html.setAttribute('data-theme', t);

      } else {
        const el = document.querySelector('html');

        if (el) {
            el.setAttribute('data-theme', t);
        }
      }
    } catch (err) {
      // ignore for SSR or environments without document
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback((t: string) => {
    setThemeState(t);
    applyTheme(t);
  }, [applyTheme]);

  return [theme, setTheme] as const;
}
