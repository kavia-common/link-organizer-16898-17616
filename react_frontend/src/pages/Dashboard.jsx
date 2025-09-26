import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import LinkCard from "../components/LinkCard";
import { AddEditLinkModal, ConfirmModal } from "../components/Modals";
import { useLinksService } from "../supabase/linksService";

// PUBLIC_INTERFACE
export default function Dashboard() {
  /**
   * Dashboard: responsive grid of links, sidebar filters/sort, CRUD modals.
   */
  const { listByUser, create, update, remove } = useLinksService();
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

  // pick categories from current data
  const categories = useMemo(() => {
    const set = new Set(links.map((l) => l.category || "General"));
    return Array.from(set).sort();
  }, [links]);

  const reload = useCallback(async () => {
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
  }, [listByUser, search, category, sort]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    // listen for navbar search events
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

  return (
    <div className="flex gap-6">
      <Sidebar
        categories={categories}
        selectedCategory={category}
        onSelect={setCategory}
        sort={sort}
        onSort={setSort}
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
          <button onClick={onAdd} className="btn btn-primary px-4 py-2">
            + Add Link
          </button>
        </div>
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-error/20 border border-error/40 text-error">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-white/70">Loading your links...</div>
        ) : links.length === 0 ? (
          <div className="card p-6 text-center text-white/70">
            No links found. Click "Add Link" to create your first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {links.map((l) => (
              <LinkCard key={l.id} link={l} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>

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
