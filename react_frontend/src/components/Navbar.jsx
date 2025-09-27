import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSupabase, useSession } from "../supabase/SupabaseProvider";
import SearchBar from "./SearchBar";

/**
 * Modern logo with gradient and glow effect
 */
function LogoMark() {
  return (
    <div className="relative">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-blue-500/50 hover:scale-105">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
      {/* Glow effect */}
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />
    </div>
  );
}

export default function Navbar() {
  const { session } = useSession();
  const { signOut } = useSupabase();
  const [query, setQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const onSearch = (q) => {
    setQuery(q);
    const evt = new CustomEvent("app:search", { detail: q });
    window.dispatchEvent(evt);
    if (location.pathname !== "/") navigate("/");
  };

  const navLinks = session ? [
    { name: "Dashboard", path: "/", icon: "🏠" },
    { name: "Profile", path: "/profile", icon: "👤" }
  ] : [];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-black/95 backdrop-blur-xl border-b border-zinc-800">
        {/* Top gradient line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />
        
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Brand */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <LogoMark />
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    LinkHub
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    Beta
                  </span>
                </div>
              </Link>

              {/* Desktop nav links */}
              {session && (
                <div className="hidden lg:flex items-center gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        location.pathname === link.path
                          ? "bg-zinc-900 text-white border border-zinc-800"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                      }`}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Center: Search (desktop) */}
            {session && (
              <div className="hidden md:block flex-1 max-w-2xl mx-8">
                <SearchBar value={query} onChange={onSearch} />
              </div>
            )}

            {/* Right: User menu */}
            <div className="flex items-center gap-3">
              {session ? (
                <>
                  {/* Notifications (optional) */}
                  <button className="hidden sm:flex w-10 h-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all relative group">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {/* Notification badge */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold border-2 border-black">
                      3
                    </span>
                  </button>

                  {/* Profile button */}
                  <Link
                    to="/profile"
                    className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white hover:border-zinc-700 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
                      {session?.user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="hidden xl:block text-left">
                      <div className="text-sm font-medium text-white">
                        {session?.user?.email?.split("@")[0] || "User"}
                      </div>
                      <div className="text-xs text-zinc-500">View profile</div>
                    </div>
                  </Link>

                  {/* Logout button */}
                  <button
                    onClick={() => signOut()}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-sm font-medium"
                    title="Sign out"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden lg:inline">Logout</span>
                  </button>

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="sm:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showMobileMenu ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 active:scale-95"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile search */}
          {session && (
            <div className="md:hidden pb-3">
              <SearchBar value={query} onChange={onSearch} />
            </div>
          )}
        </nav>

        {/* Mobile menu */}
        {showMobileMenu && session && (
          <div className="sm:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl animate-slide-down">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === link.path
                      ? "bg-zinc-900 text-white border border-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}
              
              <div className="pt-2 border-t border-zinc-800 mt-2">
                <button
                  onClick={() => {
                    signOut();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>

              <div className="pt-3 border-t border-zinc-800 mt-3">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                    {session?.user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {session?.user?.email?.split("@")[0] || "User"}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {session?.user?.email || "user@example.com"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />

      {/* Animation styles */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </>
  );
}