import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSupabase, useSession } from "../supabase/SupabaseProvider";
import SearchBar from "./SearchBar";

// PUBLIC_INTERFACE
export default function Navbar() {
  /** Fixed top navbar with app name, search bar, and auth/profile actions. */
  const { session } = useSession();
  const { signOut } = useSupabase();
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const onSearch = (q) => {
    setQuery(q);
    // broadcast a search event for dashboard to pick up
    const evt = new CustomEvent("app:search", { detail: q });
    window.dispatchEvent(evt);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <div className="fixed top-0 inset-x-0 z-40 backdrop-blur bg-black/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-soft" />
          <div className="text-white font-extrabold tracking-tight text-lg group-hover:opacity-90">
            Link Hub
          </div>
        </Link>
        <div className="flex-1 max-w-2xl mx-auto hidden md:block">
          <SearchBar value={query} onChange={onSearch} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <Link
                to="/profile"
                className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <span className="i">👤</span>
                <span className="ml-2">Profile</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="btn btn-primary px-3 py-2"
                title="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary px-4 py-2">
              Login
            </Link>
          )}
        </div>
      </div>
      <div className="md:hidden px-4 pb-3">
        <SearchBar value={query} onChange={onSearch} />
      </div>
    </div>
  );
}
