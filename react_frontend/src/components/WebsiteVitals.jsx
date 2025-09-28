import React, { useEffect, useMemo, useState } from "react";
import { useSession, useSupabase } from "../supabase/SupabaseProvider";

/**
 * WebsiteVitals modal overlays diagnostics about app health:
 * - Basic view: env config, backend reachability, auth, DB hint
 * - Advanced view (accordion): real latencies, backend restart time, Node/deps versions,
 *   frontend build hash/timestamp, Supabase quota headers (if returned), periodic jobs status
 * All checks are best-effort and fail gracefully.
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

function SectionCard({ title, right, children }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white font-semibold">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function useSafeEnv(name) {
  const v = (process.env[name] || "").trim();
  return v;
}

function formatMs(ms) {
  if (ms == null) return "n/a";
  return `${ms} ms`;
}

function useHealthCheck(apiBase, open) {
  const [state, setState] = useState({
    pending: !!apiBase && !!open,
    reachable: false,
    status: null,
    error: "",
    payload: null,
    headers: {}
  });

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!apiBase || !open) {
        setState(s => ({ ...s, pending: false }));
        return;
      }
      try {
        const url = `${apiBase.replace(/\/$/, "")}/health`;
        const t0 = performance.now();
        const res = await fetch(url, { method: "GET" });
        const t1 = performance.now();
        let payload = null;
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }
        if (aborted) return;
        const headers = {};
        // Capture possible quota/limit headers if the backend proxied them in future; defensive
        res.headers.forEach((val, key) => {
          const k = key.toLowerCase();
          if (k.includes("ratelimit") || k.includes("quota") || k.includes("limit")) {
            headers[k] = val;
          }
        });
        setState({
          pending: false,
          reachable: res.ok,
          status: res.status,
          error: res.ok ? "" : `HTTP ${res.status}`,
          payload: payload ? { ...payload, measured_latency_ms: Math.round(t1 - t0) } : null,
          headers
        });
      } catch (e) {
        if (aborted) return;
        setState({
          pending: false,
          reachable: false,
          status: null,
          error: e?.message || "Network error",
          payload: null,
          headers: {}
        });
      }
    }
    run();
    return () => {
      aborted = true;
    };
  }, [apiBase, open]);

  return state;
}

function useSupabaseLatency(supabaseUrl, open) {
  const [lat, setLat] = useState({ pending: !!supabaseUrl && !!open, ok: false, ms: null, error: "" });
  useEffect(() => {
    let aborted = false;
    async function ping() {
      if (!supabaseUrl || !open) {
        setLat({ pending: false, ok: false, ms: null, error: "" });
        return;
      }
      try {
        // ping storage/v1 (public, HEAD/GET). Use a lightweight GET for compatibility.
        const url = `${supabaseUrl.replace(/\/$/, "")}/storage/v1`;
        const t0 = performance.now();
        const res = await fetch(url, { method: "GET" });
        const t1 = performance.now();
        if (aborted) return;
        setLat({ pending: false, ok: res.ok, ms: Math.round(t1 - t0), error: res.ok ? "" : `HTTP ${res.status}` });
      } catch (e) {
        if (aborted) return;
        setLat({ pending: false, ok: false, ms: null, error: e?.message || "Network error" });
      }
    }
    ping();
    return () => { aborted = true; };
  }, [supabaseUrl, open]);
  return lat;
}

function useFrontendBuildInfo() {
  // Accept user-provided build vars from .env
  const hash = useSafeEnv("REACT_APP_BUILD_HASH") || (process.env.REACT_APP_GIT_SHA || "");
  const ts = useSafeEnv("REACT_APP_BUILD_TIME");
  const mode = process.env.NODE_ENV || "development";
  return { hash: hash || "not provided", time: ts || "not provided", mode };
}

function BackendSection({ apiBase, apiCheck, networkHint }) {
  return (
    <SectionCard
      title="Backend API"
      right={
        <Badge color={apiBase ? (apiCheck.reachable ? "green" : apiCheck.pending ? "yellow" : "red") : "purple"}>
          {apiBase ? (apiCheck.pending ? "Checking" : apiCheck.reachable ? "Reachable" : "Unreachable") : "Not configured"}
        </Badge>
      }
    >
      <VitalRow ok={!!apiBase} label="Mode" details={apiBase ? "Active (Backend API proxy)" : "Direct Supabase (no backend proxy)"} />
      <VitalRow
        ok={apiBase ? apiCheck.reachable : true}
        pending={apiBase ? apiCheck.pending : false}
        label="Health endpoint"
        details={
          apiBase
            ? apiCheck.pending
              ? "Checking /health..."
              : apiCheck.reachable
              ? `HTTP ${apiCheck.status || 200}`
              : apiCheck.error || "No response"
            : "N/A"
        }
      />
      {!!networkHint && <div className="text-yellow-300 text-xs mt-2">{networkHint}</div>}
    </SectionCard>
  );
}

function AuthSection({ isAuthed, sessionLoaded }) {
  return (
    <SectionCard title="Authentication" right={<Badge color={isAuthed ? "green" : sessionLoaded ? "yellow" : "gray"}>{isAuthed ? "Authenticated" : sessionLoaded ? "Not authenticated" : "Loading"}</Badge>}>
      <VitalRow ok={!!sessionLoaded} label="Session loaded" details={String(!!sessionLoaded)} />
      <VitalRow ok={!!isAuthed} label="User authenticated" details={String(!!isAuthed)} />
      {!isAuthed && sessionLoaded && (
        <div className="text-yellow-300 text-xs mt-2">Go to Sign In and log in to access your data.</div>
      )}
    </SectionCard>
  );
}

function DbSection({ dbInfo }) {
  return (
    <SectionCard title="Database" right={<Badge color={dbInfo === null ? "gray" : dbInfo ? "green" : "red"}>{dbInfo === null ? "Unknown" : dbInfo ? "OK" : "Issue"}</Badge>}>
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
        Production tip: Backend /health is reporting database {dbInfo ? "OK" : dbInfo === false ? "issues" : "status not provided"}.
      </div>
    </SectionCard>
  );
}

function AdvancedSection({ apiBase, apiCheck, supabaseUrl }) {
  const [open, setOpen] = useState(false);
  const backendLatency = apiCheck?.payload?.measured_latency_ms ?? null;
  const backendSelfLatency = apiCheck?.payload?.latency_ms ?? null;
  const supaPing = useSupabaseLatency(supabaseUrl, open);
  const build = useFrontendBuildInfo();

  // Supabase API rate limits: not directly accessible without specific endpoints; show headers if present
  const quotaHints = Object.entries(apiCheck.headers || {}).map(([k, v]) => `${k}: ${v}`);

  // Backend metadata
  const sys = apiCheck?.payload?.system || {};
  const jobs = apiCheck?.payload?.jobs || { configured: false, entries: [] };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
        aria-expanded={open}
      >
        <div className="text-white font-semibold">Advanced</div>
        <div className="text-xs text-zinc-400">{open ? "Hide" : "Show"}</div>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-3">
              <div className="text-white font-medium mb-1">Latency</div>
              <div className="text-xs text-zinc-400 space-y-1">
                <div>Backend health fetch: {formatMs(backendLatency)}</div>
                <div>Backend self-reported: {formatMs(backendSelfLatency)}</div>
                <div>Supabase ping: {supaPing.pending ? "checking..." : (supaPing.ok ? `${supaPing.ms} ms` : `unavailable (${supaPing.error || "error"})`)}</div>
              </div>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-3">
              <div className="text-white font-medium mb-1">Backend Runtime</div>
              <div className="text-xs text-zinc-400 space-y-1">
                <div>Restart time: {apiCheck?.payload?.system?.restart_time || "unknown"}</div>
                <div>Uptime: {apiCheck?.payload?.system?.uptime_s != null ? `${apiCheck.payload.system.uptime_s}s` : "unknown"}</div>
                <div>Node: {sys.node_version || "unknown"}</div>
                <div>Deps: {sys.dependencies ? Object.entries(sys.dependencies).map(([k,v]) => `${k}@${v}`).join(", ") : "n/a"}</div>
                <div>Mode: {(apiCheck?.payload?.env?.node_env) || (process.env.NODE_ENV || "development")}</div>
              </div>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-3">
              <div className="text-white font-medium mb-1">Frontend Build</div>
              <div className="text-xs text-zinc-400 space-y-1">
                <div>Build hash: {build.hash}</div>
                <div>Build time: {build.time}</div>
                <div>Mode: {build.mode}</div>
              </div>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-3">
              <div className="text-white font-medium mb-1">Supabase API limits</div>
              <div className="text-xs text-zinc-400 space-y-1">
                {quotaHints.length > 0 ? quotaHints.map((ln) => <div key={ln}>{ln}</div>) : <div>Not available (no quota headers detected)</div>}
              </div>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-3 md:col-span-2">
              <div className="text-white font-medium mb-1">Periodic Jobs</div>
              <div className="text-xs text-zinc-400 space-y-1">
                {jobs.configured && jobs.entries?.length
                  ? jobs.entries.map((j, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>{j.name}</div>
                        <div className="text-zinc-500">{j.status}{j.lastRun ? ` • last: ${j.lastRun}` : ""}</div>
                      </div>
                    ))
                  : <div>Not configured</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
export default function WebsiteVitals({ open, onClose }) {
  /** Modal overlay with diagnostics for Website Vitals. */
  const { session, sessionLoaded } = useSession();
  const { isConfigured } = useSupabase();

  const SUPABASE_URL = useSafeEnv("REACT_APP_SUPABASE_URL");
  const SUPABASE_KEY = useSafeEnv("REACT_APP_SUPABASE_KEY");
  const API_BASE = useSafeEnv("REACT_APP_API_BASE");

  const [networkHint, setNetworkHint] = useState("");

  // backend health check with timing and potential headers
  const apiCheck = useHealthCheck(API_BASE, open);

  useEffect(() => {
    if (!open) return;
    // Provide network hints on errors
    if (!API_BASE || apiCheck.pending || apiCheck.reachable) {
      setNetworkHint("");
      return;
    }
    const low = (apiCheck.error || "").toLowerCase();
    if (low.includes("cors") || low.includes("access-control")) setNetworkHint("Likely CORS issue: backend not allowing this origin.");
    else if (low.includes("failed to fetch") || low.includes("network")) setNetworkHint("Network/Fetch failed: backend URL unreachable or blocked.");
    else setNetworkHint("");
  }, [open, API_BASE, apiCheck.pending, apiCheck.reachable, apiCheck.error]);

  const envOk = isConfigured && SUPABASE_URL && SUPABASE_KEY;
  const isAuthed = !!session;

  // Attempt to infer DB status from backend health payload, if provided
  const dbInfo = useMemo(() => {
    const p = apiCheck.payload;
    if (!p || typeof p !== "object") return null;
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
            <SectionCard
              title="Supabase Configuration"
              right={<Badge color={envOk ? "green" : "red"}>{envOk ? "OK" : "Missing"}</Badge>}
            >
              <VitalRow ok={!!SUPABASE_URL} label="REACT_APP_SUPABASE_URL" details={SUPABASE_URL ? "(set)" : "(missing)"} />
              <VitalRow ok={!!SUPABASE_KEY} label="REACT_APP_SUPABASE_KEY" details={SUPABASE_KEY ? "(set)" : "(missing)"} />
              {!envOk && (
                <div className="text-yellow-300 text-xs mt-2">
                  One or both variables are missing. Update your .env and restart the dev server.
                </div>
              )}
            </SectionCard>

            <BackendSection apiBase={API_BASE} apiCheck={apiCheck} networkHint={networkHint} />

            <AuthSection isAuthed={isAuthed} sessionLoaded={sessionLoaded} />

            <DbSection dbInfo={dbInfo} />

            <AdvancedSection apiBase={API_BASE} apiCheck={apiCheck} supabaseUrl={SUPABASE_URL} />

            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">Remediation</div>
                <Badge color="blue">Guide</Badge>
              </div>
              <ul className="list-disc list-outside ml-5 space-y-2 text-sm text-zinc-300">
                <li>Frontend: set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in .env, then restart.</li>
                <li>Backend: set REACT_APP_API_BASE in frontend, start Express, and allow CORS for your site origin.</li>
                <li>Supabase: ensure links table, RLS policies, and optional increment_clicks RPC are created.</li>
                <li>Auth: sign out/in to refresh your session if you changed keys or URL.</li>
                <li>Networking: if health shows CORS or network errors, update CORS_ORIGINS in backend .env.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
