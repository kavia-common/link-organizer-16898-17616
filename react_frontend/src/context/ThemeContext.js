import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultTheme, lightTheme, darkTheme, getCssVarsFromTheme } from '../theme';

// PUBLIC_INTERFACE
export const ThemeContext = createContext({
  mode: 'dark',
  accent: defaultTheme.primary,
  brand: { name: 'Link Hub', logoUrl: '' },
  theme: darkTheme,
  setMode: (_m) => {},
  toggleMode: () => {},
  setAccent: (_c) => {},
  setBrand: (_b) => {},
});

/**
 * PUBLIC_INTERFACE
 * ThemeProvider wraps the app and provides theme configuration (light/dark mode, accent color, brand).
 * It also sets CSS variables for smooth transitions and persists preferences to localStorage.
 */
export function ThemeProvider({ children, initial = {} }) {
  const [mode, setMode] = useState(initial.mode || (localStorage.getItem('theme-mode') || 'dark'));
  const [accent, setAccentState] = useState(initial.accent || (localStorage.getItem('theme-accent') || defaultTheme.primary));
  const [brand, setBrandState] = useState(() => {
    try {
      const stored = localStorage.getItem('theme-brand');
      return initial.brand || (stored ? JSON.parse(stored) : { name: 'Link Hub', logoUrl: '' });
    } catch {
      return initial.brand || { name: 'Link Hub', logoUrl: '' };
    }
  });

  const theme = useMemo(() => (mode === 'light' ? { ...lightTheme, primary: accent } : { ...darkTheme, primary: accent }), [mode, accent]);

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme-accent', accent);
    localStorage.setItem('theme-brand', JSON.stringify(brand));
  }, [mode, accent, brand]);

  // Apply CSS variables on documentElement for Tailwind and raw CSS usage
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = getCssVarsFromTheme(theme);
    Object.entries(cssVars).forEach(([k, v]) => root.style.setProperty(k, v));
    // Add class for mode to leverage Tailwind dark: classes and transitions
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mode]);

  // Public setters
  const setAccent = useCallback((c) => setAccentState(c), []);
  const setBrand = useCallback((b) => setBrandState(b), []);
  const toggleMode = useCallback(() => setMode((m) => (m === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(
    () => ({ mode, accent, brand, theme, setMode, toggleMode, setAccent, setBrand }),
    [mode, accent, brand, theme, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access theme context
 */
export function useTheme() {
  return useContext(ThemeContext);
}
