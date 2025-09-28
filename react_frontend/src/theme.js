export const defaultTheme = {
  name: 'Default',
  primary: '#1f6feb',
  secondary: '#2ea043',
  background: '#0d1117',
  surface: '#161b22',
  text: '#e6edf3',
  error: '#f85149',
  gradient: 'from-blue-500/20 to-black',
};

// Light and dark base themes
export const darkTheme = {
  ...defaultTheme,
  name: 'Dark',
  background: '#0d1117',
  surface: '#161b22',
  text: '#e6edf3',
  gradient: 'from-blue-500/20 to-black',
};

export const lightTheme = {
  ...defaultTheme,
  name: 'Light',
  background: '#ffffff',
  surface: '#f4f6f8',
  text: '#0b1220',
  gradient: 'from-blue-400/10 to-white',
};

// PUBLIC_INTERFACE
export function getCssVarsFromTheme(theme) {
  /** Returns a map of CSS variables for theme usage. */
  return {
    '--bg-color': theme.background,
    '--surface-color': theme.surface,
    '--text-color': theme.text,
    '--accent-color': theme.primary,
    '--secondary-color': theme.secondary,
    '--error-color': theme.error,
  };
}

// PUBLIC_INTERFACE
export function getBrandGradient({ preferGradient = true, gradient = defaultTheme.gradient } = {}) {
  /** Returns Tailwind gradient utility string */
  return preferGradient ? `bg-gradient-to-r ${gradient}` : '';
}

export default darkTheme;
