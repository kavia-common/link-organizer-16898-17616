import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <nav className="hidden md:block w-64 border-r border-white/10" aria-label="Sidebar">
      <div className="bg-gradient-to-r from-blue-500/20 to-black" aria-hidden="true">
        <div className="h-1 w-full" />
      </div>
      <div className="p-4 surface">
        <h2 className="text-sm uppercase opacity-70 mb-3">Filters</h2>
        <ul className="space-y-2">
          <li><Link to="/" className="hover:underline">All</Link></li>
          <li><button className="hover:underline">GitHub</button></li>
          <li><button className="hover:underline">Docs</button></li>
          <li><button className="hover:underline">Tutorials</button></li>
        </ul>
      </div>
    </nav>
  );
}
