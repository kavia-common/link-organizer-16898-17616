import React, { useEffect, useMemo, useState } from "react";
import { useSession, useSupabase } from "../supabase/SupabaseProvider";

/**
 * TroubleshootingPanel renders a full diagnostic page when the app cannot load links.
 * It performs lightweight frontend diagnostics:
 * - Environment variables present?
 * - Backend API reachability (if REACT_APP_API_BASE is set)
 * - Supabase configuration state
 * - Auth session status
 * - Recent error details and fetch exception hints (CORS/network)
 * It presents actionable remediation steps and a copy-paste checklist.
 */

// Helpers
function Label({ color = "blue", children }) {
  const map = {
    blue: "text-blue-300 border-blue-500/30 bg-blue-500/10",
    red: "text-red-300 border-red-500/30 bg-red-500/10",
    yellow: "text-yellow-300 border-yellow-500/30 bg-yellow-500/10",
    green: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    purple: "text-purple-300 border-purple-500/30 bg-purple-500/10",
    gray: "text-zinc-300 border-zinc-700 bg-zinc-900/50",
  };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full border ${map[color] || map.gray}`}>
      {children}
    </span>
  );
}

function KeyVal({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="text-xs text-zinc-400">{k}</div>
      <div className="text-xs text-white/90 font-mono break-all">{v}</div>
    </div>
  );
}

function Section({ title, badge, children, desc }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-white font-semibold">{title}</h3>
        {badge}
      </div>
      {desc && <div className="px-5 pt-4 text-zinc-400 text-sm">{desc}</div>}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function TroubleshootingPanel({ lastError }) {
  /** Comprehensive diagnostics & remediation panel. */
  const { session, sessionLoaded } = useSession();
  const { isConfigured } = useSupabase();

  // Env vars
  const SUPABASE_URL = (process.env.REACT_APP_SUPABASE_URL || "").trim();
  const SUPABASE_KEY = (process.env.REACT_APP_SUPABASE_KEY || "").trim();
  const API_BASE = (process.env.REACT_APP_API_BASE || "").trim();

  const [apiCheck, setApiCheck] = useState({ checked: false, reachable: false, status: null, error: "" });
  const [networkHint, setNetworkHint] = useState("");

  // Derive error hints
  const errorText = useMemo(() => {
    const t = typeof lastError === "string" ? lastError : (lastError?.message || "");
    return t;
  }, [lastError]);

  useEffect(() => {
    // Attempt backend health check if API_BASE is set
    let aborted = false;
    async function checkApi() {
      if (!API_BASE) {
        setApiCheck({ checked: true, reachable: false, status: null, error: "" });
        return;
      }
      try {
        const url = `${API_BASE.replace(/\/$/, "")}/health`;
        const res = await fetch(url, { method: "GET" });
        if (aborted) return;
        if (res.ok) {
          setApiCheck({ checked: true, reachable: true, status: res.status, error: "" });
        } else {
          setApiCheck({ checked: true, reachable: false, status: res.status, error: `HTTP ${res.status}` });
        }
      } catch (e) {
        if (aborted) return;
        const msg = e?.message || String(e || "Network error");
        setApiCheck({ checked: true, reachable: false, status: null, error: msg });
        // Heuristic for CORS or network
        if (msg.toLowerCase().includes("cors") || msg.toLowerCase().includes("access-control")) {
          setNetworkHint("Likely CORS issue: backend not allowing this origin.");
        } else if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")) {
          setNetworkHint("Network/Fetch failed: backend URL unreachable or blocked.");
        } else {
          setNetworkHint("");
        }
      }
    }
    checkApi();
    return () => {
      aborted = true;
    };
  }, [API_BASE]);

  const envOk = isConfigured && SUPABASE_URL && SUPABASE_KEY;
  const apiMode = API_BASE ? "backend" : "direct-supabase";
  const isAuthed = !!session;

  const badgeEnv = <Label color={envOk ? "green" : "red"}>{envOk ? "OK" : "Missing"}</Label>;
  const badgeApi = <Label color={API_BASE ? (apiCheck.reachable ? "green" : "red") : "purple"}>{API_BASE ? (apiCheck.reachable ? "Reachable" : "Unreachable") : "Not configured"}</Label>;
  const badgeAuth = <Label color={isAuthed ? "green" : sessionLoaded ? "yellow" : "gray"}>{isAuthed ? "Authenticated" : (sessionLoaded ? "Not authenticated" : "Loading")}</Label>;

  const checklist = [
    "- Ensure .env in react_frontend includes:",
    "  REACT_APP_SUPABASE_URL=<your_supabase_url>",
    "  REACT_APP_SUPABASE_KEY=<your_supabase_anon_key>",
    "  # Optional if using backend proxy:",
    "  REACT_APP_API_BASE=http://localhost:4000",
    "- After editing .env, restart the dev server.",
    "- In Supabase: create table 'links' and RLS policies (see assets/supabase.md).",
    "- If using backend:",
    "  • Start the Express server (PORT default 4000).",
    "  • Set CORS_ORIGINS to your frontend origin (e.g., http://localhost:3000).",
    "- Log in again to refresh your session.",
    "- Check browser console for detailed errors.",
  ].join("\n");

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Header alert */}
        <div className="relative overflow-hidden mb-8 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-500/10 to-black">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/30 via-purple-600/10 to-blue-600/30 blur opacity-30" />
          <div className="relative p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-extrabold text-white">We’re having trouble connecting to your data</h2>
                <p className="text-zinc-300 text-sm mt-1">
                  A connectivity or configuration issue is preventing your links from loading. Use the diagnostics below to resolve it quickly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section
            title="Supabase Configuration"
            badge={badgeEnv}
            desc="The app needs REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY."
          >
            <div className="space-y-2 text-sm">
              <KeyVal k="REACT_APP_SUPABASE_URL" v={SUPABASE_URL ? "(set)" : "(missing)"} />
              <KeyVal k="REACT_APP_SUPABASE_KEY" v={SUPABASE_KEY ? "(set)" : "(missing)"} />
              <div className="mt-2">
                {envOk ? (
                  <p className="text-emerald-300 text-xs">Configuration present.</p>
                ) : (
                  <p className="text-yellow-300 text-xs">One or both variables are missing. Update .env and restart the dev server.</p>
                )}
              </div>
            </div>
          </Section>

          <Section
            title="Backend API"
            badge={badgeApi}
            desc="Optional Express backend proxy. Leave REACT_APP_API_BASE unset to use direct Supabase."
          >
            <div className="space-y-2 text-sm">
              <KeyVal k="Mode" v={apiMode} />
              <KeyVal k="REACT_APP_API_BASE" v={API_BASE || "(not set)"} />
              {API_BASE && (
                <>
                  <KeyVal k="Health Status" v={apiCheck.checked ? (apiCheck.status ?? "(no response)") : "checking..."} />
                  {apiCheck.error && <div className="text-red-300 text-xs break-all">Error: {apiCheck.error}</div>}
                  {networkHint && <div className="text-yellow-300 text-xs">{networkHint}</div>}
                </>
              )}
              {!API_BASE && <div className="text-zinc-400 text-xs">Direct Supabase mode is active.</div>}
            </div>
          </Section>

          <Section
            title="Authentication"
            badge={badgeAuth}
            desc="You must be signed in to view your links."
          >
            <div className="space-y-2 text-sm">
              <KeyVal k="Session loaded" v={String(!!sessionLoaded)} />
              <KeyVal k="User authenticated" v={String(!!isAuthed)} />
              {!isAuthed && sessionLoaded && (
                <div className="text-yellow-300 text-xs">
                  Not authenticated. Go to Sign In and log in again.
                </div>
              )}
            </div>
          </Section>

          <Section
            title="Recent Error"
            badge={<Label color={errorText ? "red" : "green"}>{errorText ? "Captured" : "None"}</Label>}
            desc="Latest error message from the failed load, useful for clues."
          >
            {errorText ? (
              <pre className="text-xs bg-black/60 border border-zinc-800 rounded-lg p-3 overflow-auto text-red-300 whitespace-pre-wrap">
                {errorText}
              </pre>
            ) : (
              <div className="text-emerald-300 text-xs">No explicit error captured.</div>
            )}
            <div className="mt-3 text-xs text-zinc-400">
              Common hints: “Failed to fetch” suggests network/CORS; 401/403 indicates auth; 500s indicate backend/db errors.
            </div>
          </Section>
        </div>

        {/* Remediation tips */}
        <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Remediation Tips</h3>
            </div>
            <Label color="blue">Actionable</Label>
          </div>
          <div className="px-6 py-5 text-sm text-zinc-300">
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Check .env for REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY. Restart the dev server after changes.</li>
              <li>If using backend, ensure it’s running and CORS allows your frontend origin. Verify REACT_APP_API_BASE points to it.</li>
              <li>Confirm Supabase database setup for the “links” table and RLS policies. See assets/supabase.md.</li>
              <li>Sign out and sign back in to refresh your session.</li>
              <li>Open browser devtools console/network to see detailed error messages.</li>
            </ul>
          </div>
        </div>

        {/* Copy checklist */}
        <div className="mt-6 bg-zinc-950/60 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-white">Setup Checklist (Copy/Paste)</div>
            <button
              className="text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              onClick={() => navigator.clipboard.writeText(checklist)}
            >
              Copy
            </button>
          </div>
          <pre className="text-[11px] leading-5 text-zinc-300 whitespace-pre-wrap">{checklist}</pre>
        </div>
      </div>
    </div>
  );
}
