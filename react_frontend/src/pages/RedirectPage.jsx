import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLinksService } from "../supabase/linksService";

/**
Route: GET /r/:id
Purpose: Minimal redirect page that increments click counter, then redirects.
It updates the 'clicks' field on the 'links' table and navigates to the 'url'.
*/

// PUBLIC_INTERFACE
export default function RedirectPage() {
  /** Increments click count, then redirects to the URL for the given link id. */
  const { id } = useParams();
  const { incrementClicks } = useLinksService();
  const [error, setError] = useState("");

  useEffect(() => {
    const normalize = (url) => {
      if (!url) return null;
      try {
        // If it already has a scheme, URL will parse. If not, prepend https://
        const u = new URL(url, url.startsWith("http") ? undefined : "https://");
        return u.toString();
      } catch {
        return null;
      }
    };

    const go = async () => {
      try {
        const res = await incrementClicks(id);
        const target = normalize(res?.url);
        if (!target) throw new Error("Invalid or missing URL for this link.");
        window.location.replace(target);
      } catch (e) {
        setError(e?.message || "Failed to redirect");
      }
    };
    go();
  }, [id, incrementClicks]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {error ? (
        <div className="card p-6 text-red-400 border-red-500/30 bg-red-500/10">Error: {error}</div>
      ) : (
        <div className="text-white/80 animate-pulse">Redirecting...</div>
      )}
    </div>
  );
}
