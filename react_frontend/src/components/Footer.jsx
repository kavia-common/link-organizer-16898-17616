import React from "react";

// PUBLIC_INTERFACE
export default function Footer() {
  /** Minimal, modern footer with quick links and subtle polish. */
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-8">
      {/* top gradient hairline */}
      <div className="h-px w-full bg-gradient-to-r from-[color:var(--primary)] via-white/30 to-[color:var(--secondary)] opacity-50" />
      <div className="relative bg-[#0b0f14]/95 border-t border-white/10 grid-overlay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--secondary)] shadow-soft" />
              <div className="text-white/80 text-sm">
                <div className="font-bold text-white">LinkHub</div>
                <div className="text-white/60">
                  © {year} All rights reserved.
                </div>
              </div>
            </div>

            {/* Quick links */}
            <nav className="text-sm text-white/70">
              <ul className="flex flex-wrap items-center gap-3 sm:gap-4">
                <li>
                  <a
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition"
                  >
                    React
                  </a>
                </li>
                <li>
                  <a
                    href="https://tailwindcss.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition"
                  >
                    Tailwind
                  </a>
                </li>
                <li>
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition"
                  >
                    Supabase
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Bottom bar */}
          <div className="mt-4 pt-4 border-t border-white/10 text-[12px] text-white/50 flex items-center justify-between">
            <span>Built with a bold, custom dark theme</span>
            <span className="hidden sm:inline">v0.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
