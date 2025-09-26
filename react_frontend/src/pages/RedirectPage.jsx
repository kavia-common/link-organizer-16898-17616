import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSupabase } from "../supabase/SupabaseProvider";

/**
Route: GET /r/:id
Purpose: Minimal redirect page that increments click counter, then redirects.
It updates the 'clicks' field on the 'links' table and navigates to the 'url'.
*/

// PUBLIC_INTERFACE
export default function RedirectPage() {
  /** Increments click count, then redirects to the URL for the given link id. */
  const { id } = useParams();
  const { supabase } = useSupabase();
  const [error, setError] = useState("");

  useEffect(() => {
    const go = async () => {
      try {
        // Retrieve the link
        const { data: existing, error: getErr } = await supabase
          .from("links")
          .select("id, url, clicks")
          .eq("id", id)
          .single();
        if (getErr) throw getErr;
        const newClicks = (existing?.clicks || 0) + 1;
        // Update clicks
        const { error: updErr } = await supabase
          .from("links")
          .update({ clicks: newClicks })
          .eq("id", id);
        if (updErr) throw updErr;
        // Redirect
        const target = existing?.url?.startsWith("http") ? existing.url : `https://${existing?.url}`;
        window.location.replace(target);
      } catch (e) {
        setError(e?.message || "Failed to redirect");
      }
    };
    go();
  }, [id, supabase]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {error ? (
        <div className="card p-6 text-error">Error: {error}</div>
      ) : (
        <div className="text-white/80 animate-pulse">Redirecting...</div>
      )}
    </div>
  );
}
