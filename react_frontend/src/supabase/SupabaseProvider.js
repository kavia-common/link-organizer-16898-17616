import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client configured via env vars.
 * IMPORTANT: Requires REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in the environment.
 */
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL || "", SUPABASE_KEY || "", {
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
  return { session: ctx?.session ?? null, sessionLoaded: ctx?.sessionLoaded ?? false };
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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSessionLoaded(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      supabase,
      session,
      sessionLoaded,
      // PUBLIC_INTERFACE
      signInWithEmail: async (email, password) => {
        /** Email/password sign-in. */
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
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    }),
    [session, sessionLoaded]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
