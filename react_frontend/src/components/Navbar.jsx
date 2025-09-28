import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-blue-500/20 to-black" aria-label="Primary navigation">
      <div className="surface">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-semibold" aria-label="Home">
            <div aria-hidden="true" className="w-8 h-8 rounded" style={{ background: 'rgba(31,111,235,0.2)', border: '1px solid rgba(31,111,235,0.4)' }} />
            <span>Link Hub</span>
          </Link>
          <div className="flex-1 px-4">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <Link to="/profile" className="btn" aria-label="Profile">Profile</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
