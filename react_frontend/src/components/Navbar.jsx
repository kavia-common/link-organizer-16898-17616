import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSupabase, useSession } from "../supabase/SupabaseProvider";
import SearchBar from "./SearchBar";

/**
 * Compact logo mark used in the navbar.
 */
function LogoMark() {
  return (
    <div className="relative h-9 w-9 rounded-xl bg-[color:var(--surface-2)] overflow-hidden">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--secondary)] opacity-90" />
      <div className="absolute -inset-5 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.25),transparent_40%)]" />
      <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
    </div>
  );
}

// PUBLIC_INTERFACE
export default function Navbar() {
  /** Fixed, bold top navbar with logo/name, responsive search, and auth/profile actions. */
  const { session } = useSession();
  const { signOut } = useSupabase();
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const onSearch = (q) => {
    setQuery(q);
    const evt = new CustomEvent("app:search", { detail: q });
    window.dispatchEvent(evt);
    if (location.pathname !== "/") navigate("/");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* Layered background with dark surface and subtle grid */}
      <div className="relative bg-[#0b0f14]/95 border-b border-white/10 backdrop-blur-md grid-overlay">
        {/* Accent bar */}
        <div className="absolute inset-x-0 -top-[1px] h-[1.5px] bg-gradient-to-r from-[color:var(--primary)] via-white/30 to-[color:var(--secondary)] opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          {/* Left: Logo + Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <LogoMark />
            <span className="text-white font-extrabold tracking-tight text-lg sm:text-xl">
              LinkHub
            </span>
            <span className="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 group-hover:text-white/80 transition">
              Beta
            </span>
          </Link>

          {/* Center: Search (desktop) */}
          <div className="hidden md:block flex-1 px-6">
            <div className="max-w-2xl mx-auto">
              <SearchBar value={query} onChange={onSearch} />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="ml-auto flex items-center gap-2">
            {session ? (
              <>
                {/* Avatar or profile button */}
                <Link
                  to="/profile"
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition shadow-sm"
                  title="Profile"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--secondary)] text-black font-bold text-xs shadow-soft">
                    {session?.user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                  <span className="hidden md:inline">
                    {session?.user?.email?.split("@")[0] || "Profile"}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="btn btn-primary px-3 py-2 rounded-xl shadow-soft"
                  title="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="btn btn-primary px-4 py-2 rounded-xl shadow-soft"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <SearchBar value={query} onChange={onSearch} />
        </div>
      </div>
    </header>
  );
}
