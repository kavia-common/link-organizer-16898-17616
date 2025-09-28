import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { mode, toggleMode, brand, theme } = useTheme();

  const gradientClass = useMemo(() => {
    return theme?.gradient ? `bg-gradient-to-r ${theme.gradient}` : '';
  }, [theme]);

  return (
    <nav className={`sticky top-0 z-40 border-b border-white/10 ${gradientClass}`} aria-label="Primary navigation">
      <div className="surface">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-[var(--bg-color)]" aria-label="Home">
            {brand?.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={`${brand?.name || 'App'} logo`}
                className="w-8 h-8 rounded"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              />
            ) : (
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded"
                style={{ background: 'rgba(31,111,235,0.2)', border: '1px solid rgba(31,111,235,0.4)' }}
              />
            )}
            <span>{brand?.name || 'Link Hub'}</span>
          </Link>
          <div className="flex-1 px-4">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`}
              title="Toggle theme"
              onClick={toggleMode}
            >
              {mode === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="Dark mode">
                  <path fill="currentColor" d="M12 2a1 1 0 0 1 1 1a7 7 0 1 0 8 8a1 1 0 0 1 1 1a9 9 0 1 1-10-10z"></path>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="Light mode">
                  <path fill="currentColor" d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8l1.8-1.8zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9-10v-2h3v2h-3zm-1.76 6.16l1.79 1.8l1.79-1.8l-1.79-1.79l-1.79 1.79zM13 1h-2v3h2V1zm-7.24 14.76l-1.8 1.8l1.8 1.79l1.79-1.79l-1.79-1.8zM12 6.5A5.5 5.5 0 1 0 12 17.5 5.5 5.5 0 1 0 12 6.5z"></path>
                </svg>
              )}
              <span className="sr-only">Toggle theme</span>
            </button>
            <Link to="/profile" className="btn" aria-label="Profile">Profile</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
