import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import linksRouter from "./routes/links.js";
import categoriesRouter from "./routes/categories.js";
import { supabaseAuthMiddleware, supabase } from "./middleware/auth.js";

dotenv.config();

const app = express();

// track backend start time and derive restart time
const START_TIME = new Date();
const START_TIME_ISO = START_TIME.toISOString();

// Security and parsing middlewares
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
// CORS
const allowed = (process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser clients
    if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"), false);
  },
  credentials: true
}));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

/**
 * PUBLIC_INTERFACE
 * GET /health
 * Returns service health including DB connectivity and operational metadata.
 * Response model:
 * {
 *   status: "ok" | "degraded" | "down",
 *   service: "linkhub-backend",
 *   time: ISOString,
 *   latency_ms: number,
 *   db: boolean,
 *   details: { message?: string, error?: string, sample?: number },
 *   env: { supabaseConfigured: boolean, node_env?: string },
 *   cors: { allowedOrigins: string[] },
 *   system: {
 *     node_version: string,
 *     dependencies?: Record<string,string>,
 *     restart_time: ISOString,
 *     uptime_s: number
 *   },
 *   jobs: { configured: boolean, entries?: Array<{name:string,status:string,lastRun?:string}> }
 * }
 */
app.get("/health", async (req, res) => {
  const start = Date.now();

  // env config flags
  const supabaseConfigured =
    !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_KEY);

  // 1) DB check (best-effort)
  let dbOk = false;
  let dbDetails = {};
  try {
    const { data, error } = await supabase.from("links").select("id").limit(1);
    if (error) {
      dbOk = false;
      dbDetails = { error: error.message };
    } else {
      dbOk = true;
      dbDetails = { message: "Supabase reachable", sample: Array.isArray(data) ? data.length : 0 };
    }
  } catch (e) {
    dbOk = false;
    dbDetails = { error: e?.message || String(e) };
  }

  // 2) Storage quick check (list operation)
  let storage = { ok: false, error: null };
  try {
    // list buckets requires service role; anon may not have it; do a HEAD ping to storage service URL
    const storageUrl =
      (process.env.REACT_APP_SUPABASE_URL || "").replace(/\/$/, "") + "/storage/v1";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const r = await fetch(storageUrl, { method: "GET", signal: controller.signal });
    clearTimeout(timer);
    storage.ok = r.ok;
    storage.error = r.ok ? null : `HTTP ${r.status}`;
  } catch (e) {
    storage = { ok: false, error: e?.message || "storage-ping-failed" };
  }

  // 3) Supabase latency timing (ping storage; proxy measure)
  const supabaseLatencyStart = Date.now();
  let supabaseLatencyMs = null;
  try {
    const pingUrl =
      (process.env.REACT_APP_SUPABASE_URL || "").replace(/\/$/, "") + "/storage/v1";
    const ctrl = new AbortController();
    const pingTimer = setTimeout(() => ctrl.abort(), 2500);
    const r2 = await fetch(pingUrl, { method: "GET", signal: ctrl.signal });
    clearTimeout(pingTimer);
    supabaseLatencyMs = Date.now() - supabaseLatencyStart;
  } catch {
    supabaseLatencyMs = null;
  }

  // 4) Dependency versions from package.json (best-effort)
  let deps = {};
  try {
    const pkg = await import("../../package.json", { with: { type: "json" } }).then(m => m.default || m);
    deps = pkg?.dependencies || {};
  } catch {
    // fallback static values if reading fails
    deps = {
      express: "unknown",
      helmet: "unknown",
      morgan: "unknown",
      cors: "unknown",
      "@supabase/supabase-js": "unknown",
    };
  }

  // 5) Build metadata passthrough from env (optional)
  const build = {
    hash: process.env.BUILD_HASH || null,
    time: process.env.BUILD_TIME || null,
  };

  const nodeVersion = process.versions?.node || "unknown";
  const status = dbOk ? "ok" : (supabaseConfigured ? "degraded" : "down");

  const payload = {
    status,
    service: "linkhub-backend",
    time: new Date().toISOString(),
    latency_ms: Date.now() - start,
    db: dbOk,
    details: dbDetails,
    env: {
      supabaseConfigured,
      node_env: process.env.NODE_ENV || "development",
    },
    cors: {
      allowedOrigins: (process.env.CORS_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    },
    system: {
      node_version: nodeVersion,
      dependencies: deps,
      restart_time: START_TIME_ISO,
      uptime_s: Math.round(process.uptime()),
    },
    jobs: {
      configured: false,
      entries: [],
    },
    supabase: {
      latency_ms: supabaseLatencyMs,
      storage_ok: storage.ok,
      storage_error: storage.error,
    },
    build,
  };

  // Expose any upstream rate limit headers if we ever proxy through here (noop today)
  try {
    res.setHeader("x-health", "ok");
  } catch {
    // ignore
  }

  res.status(200).json(payload);
});

// Public docs for how to use Web and JWT with Supabase
/**
 * Swagger/OpenAPI quick info (lightweight)
 * GET /api
 */
app.get("/api", (req, res) => {
  res.json({
    openapi: "3.0.0",
    info: {
      title: "LinkHub API",
      version: "1.0.0",
      description: "REST API for managing links and categories with Supabase auth."
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "links", description: "CRUD and search for links" },
      { name: "categories", description: "Derived categories and counts" }
    ],
    note: "Send Authorization: Bearer <supabase_jwt> for protected endpoints. Click tracking and redirect endpoints are public as per DB policies."
  });
});

// Protected routes (require Supabase JWT)
app.use("/links", supabaseAuthMiddleware, linksRouter);
app.use("/categories", supabaseAuthMiddleware, categoriesRouter);

// Public click increment (no auth) must be implemented in links router as /links/:id/click

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const code = err.status || err.code || 500;
  const msg = err.message || "Internal Server Error";
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error("[Error]", err);
  }
  res.status(code).json({ error: msg });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`LinkHub backend listening on http://localhost:${PORT}`);
});
