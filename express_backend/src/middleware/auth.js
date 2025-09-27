import { createClient } from "@supabase/supabase-js";

/**
 * Create supabase client using environment variables.
 * Env variables must be provided by orchestrator:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY (use anon for read/write via RLS; service-role if necessary on server)
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Validate config without crashing
if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.warn("[Supabase] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY in backend .env");
}

export const supabase = createClient(supabaseUrl || "http://invalid.local", supabaseKey || "invalid", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

/**
 * Extract Bearer token from Authorization header
 */
function getBearerToken(req) {
  const auth = req.headers["authorization"];
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}

/**
 * Verify Supabase JWT and attach user object to req.user
 */
export async function supabaseAuthMiddleware(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "Missing Authorization Bearer token" });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = data.user;
    return next();
  } catch (e) {
    return next(e);
  }
}
