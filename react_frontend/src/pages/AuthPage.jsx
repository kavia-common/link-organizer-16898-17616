import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSupabase, useSession } from "../supabase/SupabaseProvider";

// Refined logo with modern link symbolism
function HubMark({ size = 48, glow = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={glow ? "animate-pulse" : ""}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Modern link chain icon */}
      <path
        d="M24 34a8 8 0 0 1 0-11.3l8-8a8 8 0 0 1 11.3 11.3l-2.8 2.8"
        stroke="url(#grad)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 30a8 8 0 0 1 0 11.3l-8 8a8 8 0 0 1-11.3-11.3l2.8-2.8"
        stroke="url(#grad)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="4" fill="url(#grad)" opacity="0.4" />
    </svg>
  );
}

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail, isConfigured } = useSupabase();
  const { session } = useSession();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess(false);

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
        setSuccess(true);
      } else {
        await signUpWithEmail(email, password);
        setSuccess(true);
      }
    } catch (err) {
      setError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main auth container */}
      <div className="relative w-full max-w-md z-10">
        {/* Glowing border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000" />
        
        {/* Main card */}
        <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header section */}
          <div className="px-8 pt-8 pb-6 border-b border-zinc-800">
            <div className="flex items-center justify-center mb-6">
              <HubMark size={56} glow={success} />
            </div>
            
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-zinc-400 text-center text-sm">
              {mode === "login" 
                ? "Sign in to access your saved links" 
                : "Start organizing your favorite resources"}
            </p>
          </div>

          {/* Form section */}
          <div className="px-8 py-6">
            {/* Configuration warning */}
            {!isConfigured && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/40 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  Supabase is not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY
                  in your .env and restart the dev server.
                </p>
              </div>
            )}
            {/* Tab switcher */}
            <div className="flex gap-2 p-1 bg-zinc-950 rounded-lg mb-6 border border-zinc-800">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                  mode === "login"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                  mode === "register"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sign up
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-400 text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {mode === "login" ? "Successfully signed in!" : "Account created successfully!"}
                </p>
              </div>
            )}

            {/* Auth form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                  mode === "login"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/30"
                    : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 shadow-lg shadow-purple-500/30"
                } disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]`}
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : mode === "login" ? (
                  "Sign in to LinkHub"
                ) : (
                  "Create your account"
                )}
              </button>
            </form>

            {/* Footer text */}
            <p className="mt-6 text-center text-sm text-zinc-500">
              {mode === "login" ? "New to LinkHub?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl">🔗</div>
            <p className="text-xs text-zinc-500">Save Links</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">📊</div>
            <p className="text-xs text-zinc-500">Track Clicks</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🗂️</div>
            <p className="text-xs text-zinc-500">Organize</p>
          </div>
        </div>
      </div>
    </div>
  );
}