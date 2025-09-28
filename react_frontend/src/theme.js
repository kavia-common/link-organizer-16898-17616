export const theme = {
  // Core palette - sourced from style guide with dark, bold, high-contrast vibe
  colors: {
    background: '#000000',
    surface: '#182230',
    surfaceElevated: '#141a24',
    surfaceGlass: 'rgba(24,34,48,0.45)',
    border: 'rgba(255,255,255,0.06)',
    primary: '#ff7614',
    secondary: '#27d39a',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.7)',
    error: '#f00000',
    success: '#27d39a',
    warning: '#f59e0b',
    gradientFrom: 'rgba(255,118,20,0.2)',
    gradientTo: 'rgba(0,0,0,0.9)',
    glow: 'rgba(255,118,20,0.25)',
  },
  // Shadows and elevations to create premium depth
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.3)',
    sm: '0 2px 6px rgba(0,0,0,0.35)',
    md: '0 8px 24px rgba(0,0,0,0.45)',
    lg: '0 16px 40px rgba(0,0,0,0.5)',
    glowPrimary: '0 0 20px rgba(255,118,20,0.35)',
    glowSecondary: '0 0 20px rgba(39,211,154,0.35)',
  },
  // Radii and spacing scale
  radii: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    pill: '999px',
  },
  // Animation tokens
  animations: {
    fast: '150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    normal: '250ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    slow: '400ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  // Typography scale
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
  },
};

// PUBLIC_INTERFACE
export function applyThemeToDocument(doc = document, t = theme) {
  /**
   * Applies CSS variables from theme to the document root for easy customization.
   * This enables consistent usage of theme values across Tailwind and custom CSS.
   */
  const root = doc.documentElement;
  const set = (k, v) => root.style.setProperty(k, v);

  set('--bg', t.colors.background);
  set('--surface', t.colors.surface);
  set('--surface-elev', t.colors.surfaceElevated);
  set('--surface-glass', t.colors.surfaceGlass);
  set('--border', t.colors.border);
  set('--primary', t.colors.primary);
  set('--secondary', t.colors.secondary);
  set('--text', t.colors.text);
  set('--text-muted', t.colors.textMuted);
  set('--error', t.colors.error);
  set('--success', t.colors.success);
  set('--warning', t.colors.warning);
  set('--grad-from', t.colors.gradientFrom);
  set('--grad-to', t.colors.gradientTo);
  set('--glow', t.colors.glow);

  set('--shadow-xs', theme.shadows.xs);
  set('--shadow-sm', theme.shadows.sm);
  set('--shadow-md', theme.shadows.md);
  set('--shadow-lg', theme.shadows.lg);

  set('--radius-sm', theme.radii.sm);
  set('--radius-md', theme.radii.md);
  set('--radius-lg', theme.radii.lg);
  set('--radius-xl', theme.radii.xl);
  set('--radius-pill', theme.radii.pill);
}
