 /**
  * Link service encapsulates CRUD & analytics against Supabase.
  * Expected Supabase schema for table 'links':
  * - id: uuid (PK)
  * - user_id: uuid (FK to auth.users.id)
  * - title: text
  * - url: text
  * - description: text
  * - category: text
  * - notes: text (markdown)
  * - clicks: int8 (default 0)
  * - created_at: timestamptz default now()
  */
import { useSupabase, useSession } from "./SupabaseProvider";

// PUBLIC_INTERFACE
export function useLinksService() {
  /** Hook exposing operations for links. Must be used under SupabaseProvider. */
  const { supabase } = useSupabase();
  const { session, sessionLoaded } = useSession();
  const userId = session?.user?.id;

  /**
   * Wait for auth session to be loaded (and optionally to have a user)
   */
  async function waitForSession(timeoutMs = 5000) {
    const start = Date.now();
    // Poll every 50ms until sessionLoaded flips true or timeout
    while (!sessionLoaded && Date.now() - start < timeoutMs) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 50));
    }
    return { ready: sessionLoaded, hasUser: !!(session?.user?.id), userId: session?.user?.id };
  }

  // PUBLIC_INTERFACE
  const listByUser = async ({ search = "", category = "All", sort = "newest", limit = 100, offset = 0 } = {}) => {
    /**
     * List links for current user with filtering and sorting.
     * Ensures we don't query before auth session is ready, which would yield empty results.
     */
    if (!sessionLoaded) {
      await waitForSession();
    }
    if (!userId) {
      // Not authenticated -> explicit empty list
      return [];
    }
    let q = supabase.from("links").select("*").eq("user_id", userId);

    if (category && category !== "All") {
      q = q.eq("category", category);
    }
    if (search) {
      // Filter title/description/url/notes using ilike
      q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%,url.ilike.%${search}%,notes.ilike.%${search}%`);
    }
    switch (sort) {
      case "newest":
        q = q.order("created_at", { ascending: false });
        break;
      case "oldest":
        q = q.order("created_at", { ascending: true });
        break;
      case "most_clicked":
        q = q.order("clicks", { ascending: false });
        break;
      case "title":
        q = q.order("title", { ascending: true });
        break;
      default:
        q = q.order("created_at", { ascending: false });
    }
    // Pagination range
    q = q.range(offset, offset + limit - 1);

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  };

  // PUBLIC_INTERFACE
  const create = async ({ title, url, description, category, notes }) => {
    /** Create a new link for current user. */
    if (!sessionLoaded) {
      await waitForSession();
    }
    if (!userId) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("links")
      .insert({ title, url, description, category, notes, user_id: userId })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  };

  // PUBLIC_INTERFACE
  const update = async (id, patch) => {
    /** Update an existing link owned by current user. */
    if (!sessionLoaded) {
      await waitForSession();
    }
    if (!userId) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("links")
      .update({ ...patch })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  };

  // PUBLIC_INTERFACE
  const remove = async (id) => {
    /** Delete a link owned by current user. */
    if (!sessionLoaded) {
      await waitForSession();
    }
    if (!userId) throw new Error("Not authenticated");
    const { error } = await supabase.from("links").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
    return true;
  };

  // PUBLIC_INTERFACE
  const incrementClicks = async (id) => {
    /** 
     * Increment click count for link by id and return { clicks, url }.
     * Supports optional RPC "increment_clicks" if deployed, otherwise falls back
     * to a safe get + update.
     * This method intentionally does not require userId to allow public redirect.
     */
    // Try RPC first if available in your database
    try {
      // Attempt RPC call (will fail if function not created or not allowed)
      const { data: _rpcData, error: rpcError } = await supabase.rpc("increment_clicks", { link_id: id });
      if (!rpcError) {
        // After RPC, fetch latest clicks & url
        const { data: fresh, error: fetchErr } = await supabase
          .from("links")
          .select("clicks, url")
          .eq("id", id)
          .single();
        if (fetchErr) throw fetchErr;
        return fresh;
      }
      // fallthrough to manual if RPC not available
    } catch {
      // ignore and fallback
    }

    // Manual fallback: read current, then update
    const { data: existing, error: getErr } = await supabase
      .from("links")
      .select("clicks, url")
      .eq("id", id)
      .single();
    if (getErr) throw getErr;

    const nextClicks = (existing?.clicks || 0) + 1;
    const { error: updErr } = await supabase
      .from("links")
      .update({ clicks: nextClicks })
      .eq("id", id);
    if (updErr) throw updErr;

    return { clicks: nextClicks, url: existing?.url };
  };

  // PUBLIC_INTERFACE
  const analytics = async () => {
    /** Returns total links and sum of clicks for current user. */
    if (!sessionLoaded) {
      await waitForSession();
    }
    if (!userId) return { totalLinks: 0, totalClicks: 0 };
    const { data, error } = await supabase
      .from("links")
      .select("id,clicks")
      .eq("user_id", userId);
    if (error) throw error;
    const totalLinks = data?.length || 0;
    const totalClicks = data?.reduce((acc, l) => acc + (l.clicks || 0), 0) || 0;
    return { totalLinks, totalClicks };
  };

  return { listByUser, create, update, remove, incrementClicks, analytics };
}
