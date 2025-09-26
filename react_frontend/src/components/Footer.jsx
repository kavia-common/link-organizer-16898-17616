import React from "react";

// PUBLIC_INTERFACE
export default function Footer() {
  /** Simple footer with copyright. */
  return (
    <footer className="relative border-t border-white/10 bg-black/70 grid-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white/60 text-sm flex flex-col sm:flex-row items-center justify-between">
        <div>© {new Date().getFullYear()} LinkHub. All rights reserved.</div>
        <div className="mt-2 sm:mt-0 space-x-4">
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            Supabase
          </a>
          <a
            href="https://reactjs.org"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            React
          </a>
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            TailwindCSS
          </a>
        </div>
      </div>
    </footer>
  );
}
