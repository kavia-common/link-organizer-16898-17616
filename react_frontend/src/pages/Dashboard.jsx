import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import LinkCard from "../components/LinkCard";
import { AddEditLinkModal, ConfirmModal } from "../components/Modals";
import { useLinksService } from "../supabase/linksService";
import { useSession, useSupabase } from "../supabase/SupabaseProvider";
import TroubleshootingPanel from "../components/TroubleshootingPanel";

export default function Dashboard() {
  const { listByUser, create, update, remove } = useLinksService();
  const { sessionLoaded, session } = useSession();
  const { isConfigured } = useSupabase();
  // For diagnostics: whether backend proxy is enabled
  const API_BASE = (process.env.REACT_APP_API_BASE || "").trim();
  const usingBackend = API_BASE.length > 0;
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const categories = useMemo(() => {
    const set = new Set(links.map((l) => l.category || "General"));
    return Array.from(set).sort();
  }, [links]);

  const reload = useCallback(async () => {
    // Only attempt reload when auth state is known and we have a session
    if (!sessionLoaded) return;
    if (!session) {
      setLinks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await listByUser({ search, category, sort });
      setLinks(data);
    } catch (e) {
      setError(e?.message || "Failed to load links");
    } finally {
      setLoading(false);
    }
  }, [listByUser, search, category, sort, sessionLoaded, session]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const fn = (e) => setSearch(e.detail || "");
    window.addEventListener("app:search", fn);
    return () => window.removeEventListener("app:search", fn);
  }, []);

  const onAdd = () => {
    setEditTarget(null);
    setShowAddEdit(true);
  };

  const onEdit = (link) => {
    setEditTarget(link);
    setShowAddEdit(true);
  };

  const onDelete = (link) => {
    setDeleteTarget(link);
    setShowConfirm(true);
  };

  const handleSubmitLink = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        await update(editTarget.id, form);
      } else {
        await create(form);
      }
      setShowAddEdit(false);
      setEditTarget(null);
      reload();
    } catch (e) {
      alert(e?.message || "Failed to save link");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      setShowConfirm(false);
      setDeleteTarget(null);
      reload();
    } catch (e) {
      alert(e?.message || "Failed to delete link");
    } finally {
      setDeleting(false);
    }
  };

  // Decide when to show the troubleshooting panel (visually distinct from normal states)
  const showTroubleshooting = useMemo(() => {
    // 1) Missing supabase config is fatal
    if (!isConfigured) return true;

    // 2) If backend mode is on and we encountered an error and nothing loaded
    if (usingBackend && error && links.length === 0) return true;

    // 3) Auth loaded but not authenticated and we are on dashboard (should redirect via ProtectedRoute already)
    // However, if session is null but ProtectedRoute let us through (unlikely), show troubleshooting.
    if (sessionLoaded && !session) return true;

    // 4) Generic: if we have a hard error and no data after load completed
    if (!loading && error && links.length === 0) return true;

    return false;
  }, [isConfigured, usingBackend, error, links.length, loading, sessionLoaded, session]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showTroubleshooting ? (
          <TroubleshootingPanel lastError={error} />
        ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-6">
              <Sidebar
                categories={categories}
                selectedCategory={category}
                onSelect={setCategory}
                sort={sort}
                onSort={setSort}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    My Links
                  </h1>
                  <p className="text-zinc-400 text-sm">
                    {!loading && (
                      <>
                        {links.length} {links.length === 1 ? "link" : "links"}
                        {category !== "All" && ` in ${category}`}
                        {search && ` matching "${search}"`}
                      </>
                    )}
                  </p>
                </div>
                
                <button 
                  onClick={onAdd}
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 active:scale-95 flex items-center gap-2 justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Link
                </button>
              </div>

              {/* Stats bar */}
              {!loading && links.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-zinc-400 text-xs font-medium mb-1">Total Links</div>
                    <div className="text-2xl font-bold text-white">{links.length}</div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-zinc-400 text-xs font-medium mb-1">Categories</div>
                    <div className="text-2xl font-bold text-white">{categories.length}</div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-zinc-400 text-xs font-medium mb-1">Total Clicks</div>
                    <div className="text-2xl font-bold text-white">
                      {links.reduce((sum, l) => sum + (l.clicks || 0), 0)}
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-zinc-400 text-xs font-medium mb-1">Most Popular</div>
                    <div className="text-lg font-bold text-white truncate">
                      {links.length > 0 
                        ? links.reduce((max, l) => (l.clicks || 0) > (max.clicks || 0) ? l : max, links[0])?.title?.slice(0, 12) || "—"
                        : "—"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-red-400">Error</div>
                  <div className="text-red-300 text-sm mt-1">{error}</div>
                </div>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                {/* Spinner with gradient ring */}
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur opacity-30" />
                  <svg className="animate-spin h-12 w-12 relative text-white" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V1.6C5.582 1.6 1.6 5.582 1.6 12H4zm2.4 6.614A7.962 7.962 0 014 12H1.6c0 3.27 1.219 6.259 3.2 8.514L6.4 18.614z" />
                  </svg>
                </div>
                <p className="text-zinc-400 text-sm">
                  Fetching your links...
                </p>
              </div>
            ) : links.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl backdrop-blur-sm">
                {/* Empty-state illustration */}
                <div className="relative mb-6">
                  <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl" />
                  <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center relative">
                    <svg className="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-2">
                  {search
                    ? "No matches found"
                    : category !== "All"
                      ? "This category is empty"
                      : "No links yet!"}
                </h3>
                <p className="text-zinc-400 text-center mb-6 max-w-md">
                  {search
                    ? `We couldn't find links matching "${search}". Try a different keyword.`
                    : category !== "All"
                      ? `You haven't added any links to "${category}" yet.`
                      : "Add your first resource to kickstart your collection."}
                </p>
                {/* CTA only when it's truly empty dashboard context (no search, All category) */}
                {!search && category === "All" && (
                  <button
                    onClick={onAdd}
                    className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 active:scale-95 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add your first link
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                {links.map((link, idx) => (
                  <div 
                    key={link.id}
                    className="item-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <LinkCard 
                      link={link} 
                      onEdit={onEdit} 
                      onDelete={onDelete} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Modals */}
      <AddEditLinkModal
        open={showAddEdit}
        onClose={() => setShowAddEdit(false)}
        initial={editTarget}
        onSubmit={handleSubmitLink}
        loading={saving}
      />
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        text={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
}