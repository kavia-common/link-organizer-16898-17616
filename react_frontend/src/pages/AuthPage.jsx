import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSupabase, useSession } from "../supabase/SupabaseProvider";

// PUBLIC_INTERFACE
export default function AuthPage() {
  /** Auth page for login/register via Supabase. */
  const { signInWithEmail, signUpWithEmail } = useSupabase();
  const { session } = useSession();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 card p-6">
      <h1 className="text-2xl font-extrabold text-white">
        {mode === "login" ? "Welcome back" : "Create an account"}
      </h1>
      <p className="text-white/60 mt-1">
        {mode === "login" ? "Sign in to continue." : "Sign up to start saving links."}
      </p>
      {error && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-error/20 border border-error/40 text-error">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-white/80 text-sm mb-1">Email</label>
          <input
            required
            type="email"
            className="w-full px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-1">Password</label>
          <input
            required
            type="password"
            className="w-full px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full py-2" disabled={busy}>
          {busy ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>
      </form>
      <div className="text-white/70 text-sm mt-4">
        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-primary font-semibold"
        >
          {mode === "login" ? "Register" : "Login"}
        </button>
      </div>
    </div>
  );
}
