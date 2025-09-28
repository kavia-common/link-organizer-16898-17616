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
  let dbOk = false;
  let details = {};
  const supabaseConfigured =
    !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_KEY);

  try {
    // Lightweight DB check: minimal select with limit 1 on links (may rely on anon policy).
    const { data, error } = await supabase
      .from("links")
      .select("id")
      .limit(1);

    if (error) {
      dbOk = false;
      details = { error: error.message };
    } else {
      dbOk = true;
      details = { message: "Supabase reachable", sample: Array.isArray(data) ? data.length : 0 };
    }
  } catch (e) {
    dbOk = false;
    details = { error: e?.message || String(e) };
  }

  const status = dbOk ? "ok" : (supabaseConfigured ? "degraded" : "down");

  // Derive dependency versions for key libs we use (best-effort; avoid heavy fs reads)
  const dependencies = {
    express: (express?.name && typeof express?.name === "string") ? undefined : undefined
  };
  // Prefer exposing explicit known versions from process.versions when applicable
  const nodeVersion = process.versions?.node || "unknown";

  const payload = {
    status,
    service: "linkhub-backend",
    time: new Date().toISOString(),
    latency_ms: Date.now() - start,
    db: dbOk,
    details,
    env: { supabaseConfigured, node_env: process.env.NODE_ENV || "development" },
    cors: {
      allowedOrigins: (process.env.CORS_ORIGINS || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
    },
    system: {
      node_version: nodeVersion,
      dependencies: {
        // Best-effort to publish major versions we care about; values can be refined by CI if desired
        express: "4.x",
        helmet: "7.x",
        morgan: "1.x",
        cors: "2.x",
        "@supabase/supabase-js": "2.x"
      },
      restart_time: START_TIME_ISO,
      uptime_s: Math.round(process.uptime())
    },
    // Jobs section placeholder. Integrators can replace with real scheduler status.
    jobs: {
      configured: false,
      entries: []
    }
  };
  // Always return 200 OK; consumers should inspect payload.status for detailed state.
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
