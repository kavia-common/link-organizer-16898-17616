import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSupabase, useSession } from "../supabase/SupabaseProvider";

// Simple inline SVG logo representing a "Link/Resource Hub"
function HubMark({ size = 52, glow = false }) {
  const cls = glow ? "filter drop-shadow-[0_0_12px_rgba(255,118,20,0.5)]" : "";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cls}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff7614" />
          <stop offset="100%" stopColor="#27d39a" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="12" fill="url(#g)" opacity="0.18" />
      <path
        d="M25 33a6 6 0 0 1 0-8l6-6a6 6 0 0 1 8.5 8.5l-2.2 2.2"
        stroke="#ff7614"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M39 31a6 6 0 0 1 0 8l-6 6a6 6 0 0 1-8.5-8.5l2.2-2.2"
        stroke="#27d39a"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="3" fill="#fff" opacity="0.9" />
    </svg>
  );
}

// PUBLIC_INTERFACE
export default function AuthPage() {
  /**
   * Auth page for login/register via Supabase, redesigned for a bold,
   * GitHub-inspired dark theme with vibrant accents and modern UI.
   * Core logic unchanged; visual enhancements only.
   */
  const { signInWithEmail, signUpWithEmail } = useSupabase();
  const { session } = useSession();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successPulse, setSuccessPulse] = useState(false);
  const [shake, setShake] = useState(false);

  const title = mode === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "login"
      ? "Sign in to your Link Hub"
      : "Register to start saving and organizing your resources";

  if (session) return <Navigate to="/" replace />;

  // compute opposite mode inline where needed to avoid extra hooks

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setShake(false);
    setSuccessPulse(false);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
        // Brief success glow before redirect happens via auth state change
        setSuccessPulse(true);
      } else {
        await signUpWithEmail(email, password);
        setSuccessPulse(true);
      }
    } catch (err) {
      setError(err?.message || "Something went wrong");
      // trigger subtle shake
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px-64px)] flex items-center justify-center">
      {/* Animated / patterned background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-secondary/20 blur-3xl animate-[pulse_3s_ease_infinite_1s]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "22px 22px"
          }}
        />
      </div>

      {/* Center card */}
      <div
        className={[
          "relative w-full max-w-md mx-4",
          successPulse ? "ring-2 ring-success/60 ring-offset-0" : ""
        ].join(" ")}
      >
        <div
          className={[
            "card p-6 sm:p-8 backdrop-blur-md bg-surface/95",
            "transition-all duration-300",
            shake ? "animate-[wiggle_0.4s_ease]" : ""
          ].join(" ")}
          style={{
            // define keyframes via inline style fallback for wiggle
            animationName: shake ? undefined : undefined
          }}
        >
          {/* Logo and heading */}
          <div className="flex items-center gap-3 mb-2">
            <div className="shrink-0">
              <HubMark glow={successPulse} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {title}
              </h1>
              <p className="text-white/60 text-sm sm:text-base">{subtitle}</p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="mt-4 flex items-center rounded-xl overflow-hidden border border-white/10">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 px-4 py-2 text-sm sm:text-base transition ${
                mode === "login"
                  ? "bg-primary text-black font-bold"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
              type="button"
              aria-pressed={mode === "login"}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 px-4 py-2 text-sm sm:text-base transition ${
                mode === "register"
                  ? "bg-secondary text-black font-bold"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
              type="button"
              aria-pressed={mode === "register"}
            >
              Register
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 px-3 py-2 rounded-lg bg-error/15 border border-error/40 text-error flex items-start gap-2">
              <span aria-hidden>⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-white/80 text-xs uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative group">
                <input
                  required
                  type="email"
                  className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition">
                  ✉️
                </div>
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-xs uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative group">
                <input
                  required
                  type="password"
                  className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-secondary transition">
                  🔒
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-extrabold tracking-wide transition-transform active:scale-[0.99] shadow-soft ${
                mode === "login"
                  ? "bg-primary text-black hover:opacity-90"
                  : "bg-secondary text-black hover:opacity-90"
              } ${busy ? "opacity-80 cursor-not-allowed" : ""}`}
              disabled={busy}
            >
              {busy
                ? "Please wait..."
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          {/* Bottom helper */}
          <div className="mt-5 text-white/70 text-sm text-center">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary font-semibold underline-offset-2 hover:underline"
              type="button"
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </div>
        </div>

        {/* Decorative glow ring */}
        <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 blur opacity-60" />
      </div>

      {/* Local keyframes for wiggle (shake) */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-4px); }
          30% { transform: translateX(4px); }
          45% { transform: translateX(-3px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }
        .animate-[wiggle_0.4s_ease] {
          animation: wiggle 0.4s ease;
        }
      `}</style>
    </div>
  );
}
