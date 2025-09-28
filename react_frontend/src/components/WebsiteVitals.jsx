import React, { useEffect, useMemo, useState } from "react";
import { useSession, useSupabase } from "../supabase/SupabaseProvider";

/**
 * WebsiteVitals modal overlays diagnostics about app health:
 * - Supabase config presence
 * - Backend API reachability (optional)
 * - Auth/session info
 * - Network/CORS hints from backend fetch
 * - Database hint (based on backend /health payload shape if available)
 * Dark theme + Tailwind styling with bold green/red indicators.
 */

// Small badge/label
function Badge({ color = "gray", children }) {
  const map = {
    green: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    red: "text-red-300 border-red-500/30 bg-red-500/10",
    yellow: "text-yellow-300 border-yellow-500/30 bg-yellow-500/10",
    purple: "text-purple-300 border-purple-500/30 bg-purple-500/10",
    gray: "text-zinc-300 border-zinc-700 bg-zinc-900/50",
    blue: "text-blue-300 border-blue-500/30 bg-blue-500/10",
  };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full border ${map[color] || map.gray}`}>
      {children}
    </span>
  );
}

// A line with icon, label, and details
function VitalRow({ ok, label, details, pending = false }) {
  const color = pending ? "text-yellow-400" : ok ? "text-emerald-400" : "text-red-400";
  const icon = pending ? (
    // clock icon
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : ok ? (
    // check-circle
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
  ) : (
    // x-circle
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
  );
  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`mt-0.5 ${color}`}>{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">{label}</div>
        {details && <div className="text-xs text-zinc-400 mt-0.5 break-words">{details}</div>}
      </div>
      <div>
        <Badge color={pending ? "yellow" : ok ? "green" : "red"}>{pending ? "Checking" : ok ? "OK" : "Issue"}</Badge>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function WebsiteVitals({ open, onClose }) {
  /** Modal overlay with diagnostics for Website Vitals. */
  const { session, sessionLoaded } = useSession();
  const { isConfigured } = useSupabase();

  const SUPABASE_URL = (process.env.REACT_APP_SUPABASE_URL || "").trim();
  const SUPABASE_KEY = (process.env.REACT_APP_SUPABASE_KEY || "").trim();
  const API_BASE = (process.env.REACT_APP_API_BASE || "").trim();

  const [apiCheck, setApiCheck] = useState({ pending: !!API_BASE, reachable: false, status: null, error: "", payload: null });
  const [networkHint, setNetworkHint] = useState("");

  useEffect(() => {
    // ESC to close
    if (!open) return;
    const esc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  useEffect(() => {
    let aborted = false;
    async function checkApi() {
      if (!API_BASE) {
        setApiCheck({ pending: false, reachable: false, status: null, error: "", payload: null });
        return;
      }
      try {
        const url = `${API_BASE.replace(/\/$/, "")}/health`;
        const res = await fetch(url, { method: "GET" });
        if (aborted) return;
        let payload = null;
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }
        if (res.ok) {
          setApiCheck({ pending: false, reachable: true, status: res.status, error: "", payload });
        } else {
          setApiCheck({ pending: false, reachable: false, status: res.status, error: `HTTP ${res.status}`, payload });
        }
      } catch (e) {
        if (aborted) return;
        const msg = e?.message || String(e || "Network error");
        setApiCheck({ pending: false, reachable: false, status: null, error: msg, payload: null });
        // Hints
        const low = msg.toLowerCase();
        if (low.includes("cors") || low.includes("access-control")) {
          setNetworkHint("Likely CORS issue: backend not allowing this origin.");
        } else if (low.includes("failed to fetch") || low.includes("network")) {
          setNetworkHint("Network/Fetch failed: backend URL unreachable or blocked.");
        } else {
          setNetworkHint("");
        }
      }
    }
    if (open) {
      checkApi();
    }
    return () => {
      aborted = true;
    };
  }, [API_BASE, open]);

  const envOk = isConfigured && SUPABASE_URL && SUPABASE_KEY;
  const isAuthed = !!session;

  // Attempt to infer DB status from backend health payload, if provided
  const dbInfo = useMemo(() => {
    const p = apiCheck.payload;
    if (!p || typeof p !== "object") return null;
    // Accept common shapes like { db: "ok" } or { database: { ok: true } } or { status: { db: true } }
    if (typeof p.db === "string") return p.db.toLowerCase() === "ok";
    if (typeof p.db === "boolean") return p.db;
    if (p.database && typeof p.database.ok === "boolean") return p.database.ok;
    if (p.status && typeof p.status.db === "boolean") return p.status.db;
    return null;
  }, [apiCheck.payload]);

  if (!open) return <></>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      {/* Dialog */}
      <div className="relative w-full max-w-2xl mx-4">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20" />
        <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                {/* Heartbeat icon */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 2-4 1.5 3H21" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8a7.5 7.5 0 00-13.5-4.5L7 5 5.5 3.5A7.5 7.5 0 003 8c0 7 9 12 9 12s9-5 9-12z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg">Website Vitals</h3>
                <div className="text-xs text-zinc-500">Diagnostics for your app configuration & connectivity</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">Supabase Configuration</div>
                <Badge color={envOk ? "green" : "red"}>{envOk ? "OK" : "Missing"}</Badge>
              </div>
              <VitalRow
                ok={!!SUPABASE_URL}
                label="REACT_APP_SUPABASE_URL"
                details={SUPABASE_URL ? "(set)" : "(missing)"}
              />
              <VitalRow
                ok={!!SUPABASE_KEY}
                label="REACT_APP_SUPABASE_KEY"
                details={SUPABASE_KEY ? "(set)" : "(missing)"}
              />
              {!envOk && (
                <div className="text-yellow-300 text-xs mt-2">
                  One or both variables are missing. Update your .env and restart the dev server.
                </div>
              )}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">Backend API</div>
                <Badge color={API_BASE ? (apiCheck.reachable ? "green" : apiCheck.pending ? "yellow" : "red") : "purple"}>
                  {API_BASE ? (apiCheck.pending ? "Checking" : apiCheck.reachable ? "Reachable" : "Unreachable") : "Not configured"}
                </Badge>
              </div>
              <VitalRow
                ok={!!API_BASE}
                label="Mode"
                details={API_BASE ? "backend" : "direct-supabase (no API proxy)"}
              />
              <VitalRow
                ok={API_BASE ? apiCheck.reachable : true}
                pending={API_BASE ? apiCheck.pending : false}
                label="Health endpoint"
                details={
                  API_BASE
                    ? apiCheck.pending
                      ? "Checking /health..."
                      : apiCheck.reachable
                        ? `HTTP ${apiCheck.status || 200}`
                        : apiCheck.error || "No response"
                    : "N/A"
                }
              />
              {!!networkHint && <div className="text-yellow-300 text-xs mt-2">{networkHint}</div>}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">Authentication</div>
                <Badge color={isAuthed ? "green" : sessionLoaded ? "yellow" : "gray"}>
                  {isAuthed ? "Authenticated" : sessionLoaded ? "Not authenticated" : "Loading"}
                </Badge>
              </div>
              <VitalRow ok={!!sessionLoaded} label="Session loaded" details={String(!!sessionLoaded)} />
              <VitalRow ok={!!isAuthed} label="User authenticated" details={String(!!isAuthed)} />
              {!isAuthed && sessionLoaded && (
                <div className="text-yellow-300 text-xs mt-2">Go to Sign In and log in to access your data.</div>
              )}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">Database</div>
                <Badge color={dbInfo === null ? "gray" : dbInfo ? "green" : "red"}>
                  {dbInfo === null ? "Unknown" : dbInfo ? "OK" : "Issue"}
                </Badge>
              </div>
              <VitalRow
                ok={dbInfo === null ? true : !!dbInfo}
                label="DB status"
                details={
                  dbInfo === null
                    ? "No DB signal from backend /health. If using backend, include a DB flag."
                    : dbInfo
                      ? "Database healthy (per backend)"
                      : "Backend reports DB problem"
                }
              />
              <div className="text-xs text-zinc-500 mt-2">
                Tip: If using the Express backend, expose /health with database status to improve visibility.
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">Remediation</div>
                <Badge color="blue">Guide</Badge>
              </div>
              <ul className="list-disc list-outside ml-5 space-y-2 text-sm text-zinc-300">
                <li>Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are set in .env (frontend).</li>
                <li>If using the backend, set REACT_APP_API_BASE and start the Express server.</li>
                <li>Configure CORS on backend to allow your frontend origin (e.g., http://localhost:3000).</li>
                <li>Ensure Supabase 'links' table and RLS policies exist (see assets/supabase.md).</li>
                <li>Sign out/in to refresh your session after environment changes.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
