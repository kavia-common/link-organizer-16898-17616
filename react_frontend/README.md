# React Frontend

This project was bootstrapped with Create React App and Tailwind. 

## Branding and Theme

- ThemeProvider (src/context/ThemeContext.js) manages:
  - Light/Dark mode with persistence (localStorage), smooth transitions.
  - Accent color selection which updates CSS variables across the app.
  - Brand object { name, logoUrl } to display custom logo in Navbar.
- Configure defaults in src/theme.js or interactively in Profile > Brand & Accent (BrandSettings).

### Using the Theme API

- useTheme() returns:
  - mode, toggleMode()
  - accent, setAccent(colorHex)
  - brand, setBrand({ name, logoUrl })
  - theme object and CSS variables are auto-applied.

### Gradient Banner

- Navbar and Sidebar top edge show optional gradient from theme.gradient. Customize in theme.js.

### Accessibility Improvements

- Semantic landmarks: header, nav, main, footer, sections.
- Focus rings via :focus-visible and high-contrast colors from CSS variables.
- Modals: role="dialog", aria-modal, Escape to close, Tab focus trap, click outside to close.
- Buttons and interactive elements have labels and are keyboard navigable.

## Dynamic Brand/Theme Switching

- Programmatic:
  const { setAccent, setBrand, setMode, toggleMode } = useTheme();
- UI:
  Open Profile page > Brand & Accent to set Logo URL and Accent color.
- To ship a default logo: place it in public/assets/logo.png and set BrandSettings or defaults.

```env
# Required environment variables (already supported in app)
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_KEY=...
REACT_APP_SITE_URL=...
REACT_APP_API_BASE=...
```

Note: Do not commit real secrets. Use a .env file for local dev.
