import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client configured via env vars.
 * IMPORTANT: Requires REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in the environment.
 */
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

// Validate configuration early and provide clear diagnostics in the console.
// We avoid hard-crashing the app; instead we expose isConfigured=false so the UI can inform the user.
const isConfigured =
  typeof SUPABASE_URL === "string" &&
  SUPABASE_URL.trim().length > 0 &&
  typeof SUPABASE_KEY === "string" &&
  SUPABASE_KEY.trim().length > 0;

if (!isConfigured) {
  // Mask the key if any value is present to aid debugging without leaking secrets
  const maskedKey =
    SUPABASE_KEY && SUPABASE_KEY.length > 6
      ? `${SUPABASE_KEY.slice(0, 3)}***${SUPABASE_KEY.slice(-3)}`
      : SUPABASE_KEY || "(empty)";
  // eslint-disable-next-line no-console
  console.error(
    "[Supabase] Missing configuration. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env. " +
      `Current URL: ${SUPABASE_URL || "(empty)"} | KEY: ${maskedKey}`
  );
}

const supabase = createClient(SUPABASE_URL || "http://invalid.local", SUPABASE_KEY || "invalid", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const Ctx = createContext(null);

// PUBLIC_INTERFACE
export function useSupabase() {
  /** Returns low-level supabase client and auth helpers. */
  return useContext(Ctx);
}

// PUBLIC_INTERFACE
export function useSession() {
  /** Lightweight hook to read current auth session and loading state. */
  const ctx = useSupabase();
  return {
    session: ctx?.session ?? null,
    sessionLoaded: ctx?.sessionLoaded ?? false,
  };
}

// PUBLIC_INTERFACE
export function SupabaseProvider({ children }) {
  /**
   * Provides supabase client, session, and helpers to the app.
   * It subscribes to auth state changes, exposing { session, sessionLoaded }.
   */
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    // If not configured, quickly mark sessionLoaded so UI can show guidance
    if (!isConfigured) {
      setSession(null);
      setSessionLoaded(true);
      return;
    }

    let unsub = null;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSessionLoaded(true);
    });

    unsub = sub?.subscription?.unsubscribe?.bind(sub.subscription) || null;
    return () => {
      try {
        unsub && unsub();
      } catch {
        // no-op
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      supabase,
      session,
      sessionLoaded,
      isConfigured,
      // PUBLIC_INTERFACE
      signInWithEmail: async (email, password) => {
        /** Email/password sign-in. */
        if (!isConfigured) {
          throw new Error(
            "Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env."
          );
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      },
      // PUBLIC_INTERFACE
      signUpWithEmail: async (email, password) => {
        /**
         * Email/password sign-up with redirect to SITE URL if provided.
         * Requires REACT_APP_SITE_URL (optional) to be set by orchestrator for proper email redirects.
         */
        if (!isConfigured) {
          throw new Error(
            "Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env."
          );
        }
        const redirectTo = process.env.REACT_APP_SITE_URL
          ? `${process.env.REACT_APP_SITE_URL}/auth`
          : undefined;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo }
        });
        if (error) throw error;
        return data;
      },
      // PUBLIC_INTERFACE
      signOut: async () => {
        /** Signs out the current user. */
        if (!isConfigured) {
          // Nothing to do but also not an error
          return;
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    }),
    [session, sessionLoaded]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
