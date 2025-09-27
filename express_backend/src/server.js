import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import linksRouter from "./routes/links.js";
import categoriesRouter from "./routes/categories.js";
import { supabaseAuthMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();

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

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "linkhub-backend", time: new Date().toISOString() });
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
