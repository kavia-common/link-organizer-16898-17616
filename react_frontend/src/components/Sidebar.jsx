import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const { theme } = useTheme();
  const gradientClass = useMemo(() => (theme?.gradient ? `bg-gradient-to-r ${theme.gradient}` : ''), [theme]);

  return (
    <nav className="hidden md:block w-64 border-r border-white/10" aria-label="Sidebar">
      <div className={gradientClass} aria-hidden="true">
        <div className="h-1 w-full" />
      </div>
      <div className="p-4 surface">
        <h2 className="text-sm uppercase opacity-70 mb-3">Filters</h2>
        <ul className="space-y-2">
          <li><Link to="/" className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]">All</Link></li>
          <li><button className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]">GitHub</button></li>
          <li><button className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]">Docs</button></li>
          <li><button className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]">Tutorials</button></li>
        </ul>
      </div>
    </nav>
  );
}
