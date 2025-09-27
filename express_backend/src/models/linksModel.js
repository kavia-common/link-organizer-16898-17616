import { supabase } from "../middleware/auth.js";

/**
 PUBLIC_INTERFACE
 getUserLinks(userId, opts)
 Returns list of links for a user, filtered and sorted.
*/
export async function getUserLinks(userId, { search = "", category = "All", sort = "newest", limit = 50, offset = 0 } = {}) {
  let q = supabase.from("links").select("*").eq("user_id", userId);

  if (category && category !== "All") {
    q = q.eq("category", category);
  }
  if (search) {
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
  q = q.range(offset, offset + limit - 1);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

/**
 PUBLIC_INTERFACE
 createLink(userId, payload)
 Creates a new link for the user.
*/
export async function createLink(userId, payload) {
  const { data, error } = await supabase
    .from("links")
    .insert({ ...payload, user_id: userId })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 PUBLIC_INTERFACE
 updateLink(userId, id, patch)
 Updates a link if it belongs to the user.
*/
export async function updateLink(userId, id, patch) {
  const { data, error } = await supabase
    .from("links")
    .update({ ...patch })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 PUBLIC_INTERFACE
 deleteLink(userId, id)
 Deletes a link if it belongs to the user.
*/
export async function deleteLink(userId, id) {
  const { error } = await supabase.from("links").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
  return true;
}

/**
 PUBLIC_INTERFACE
 getUserAnalytics(userId)
 Returns { totalLinks, totalClicks }
*/
export async function getUserAnalytics(userId) {
  const { data, error } = await supabase.from("links").select("id,clicks").eq("user_id", userId);
  if (error) throw error;
  const totalLinks = data?.length || 0;
  const totalClicks = data?.reduce((acc, l) => acc + (l.clicks || 0), 0) || 0;
  return { totalLinks, totalClicks };
}

/**
 PUBLIC_INTERFACE
 getCategories(userId)
 Returns list of unique categories with counts
*/
export async function getCategories(userId) {
  const { data, error } = await supabase
    .from("links")
    .select("category, id")
    .eq("user_id", userId);
  if (error) throw error;
  const map = new Map();
  (data || []).forEach(row => {
    const key = row.category || "General";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

/**
 PUBLIC_INTERFACE
 incrementClicksPublic(id)
 Increments clicks for a link (public), returns { clicks, url }.
 Requires either RPC function policy or permissive RLS for select/update.
*/
export async function incrementClicksPublic(id) {
  // Try RPC first
  try {
    const { error: rpcErr } = await supabase.rpc("increment_clicks", { link_id: id });
    if (!rpcErr) {
      const { data, error: fetchErr } = await supabase.from("links").select("clicks, url").eq("id", id).single();
      if (fetchErr) throw fetchErr;
      return data;
    }
  } catch {
    // ignore and fallback
  }
  // Fallback: manual read then update
  const { data: existing, error: getErr } = await supabase.from("links").select("clicks, url").eq("id", id).single();
  if (getErr) throw getErr;
  const next = (existing?.clicks || 0) + 1;
  const { error: updErr } = await supabase.from("links").update({ clicks: next }).eq("id", id);
  if (updErr) throw updErr;
  return { clicks: next, url: existing?.url };
}

/**
 PUBLIC_INTERFACE
 getLinkPublic(id)
 Fetches link by id with minimal fields (for redirect preview or validation).
*/
export async function getLinkPublic(id) {
  const { data, error } = await supabase.from("links").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
