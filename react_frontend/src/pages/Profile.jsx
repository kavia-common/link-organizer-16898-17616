import React, { useEffect, useState } from "react";
import { useSupabase } from "../supabase/SupabaseProvider";
import { useLinksService } from "../supabase/linksService";
import LinkCard from "../components/LinkCard";
import { AddEditLinkModal, ConfirmModal } from "../components/Modals";

// PUBLIC_INTERFACE
export default function Profile() {
  /** Profile page with tabs: My Links, Analytics, Settings. */
  const { supabase } = useSupabase();
  const { listByUser, update, remove, analytics } = useLinksService();
  const [tab, setTab] = useState("links");
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0 });
  const [editTarget, setEditTarget] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const [ls, an] = await Promise.all([
      listByUser({}),
      analytics()
    ]);
    setLinks(ls || []);
    setStats(an || { totalLinks: 0, totalClicks: 0 });
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEdit = (l) => {
    setEditTarget(l);
    setShowEdit(true);
  };

  const onDelete = (l) => {
    setDeleteTarget(l);
    setShowConfirm(true);
  };

  const handleSave = async (form) => {
    setBusy(true);
    try {
      await update(editTarget.id, form);
      setShowEdit(false);
      setEditTarget(null);
      reload();
    } catch (e) {
      alert(e?.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await remove(deleteTarget.id);
      setShowConfirm(false);
      setDeleteTarget(null);
      reload();
    } catch (e) {
      alert(e?.message || "Failed to delete");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white mb-4">Profile</h1>

      <div className="flex gap-2 mb-6">
        {[
          { id: "links", label: "My Links" },
          { id: "analytics", label: "Analytics" },
          { id: "settings", label: "Settings" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg border ${
              tab === t.id
                ? "bg-primary text-black border-primary"
                : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "links" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {links.map((l) => (
            <LinkCard key={l.id} link={l} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {links.length === 0 && (
            <div className="card p-6 text-center text-white/70">
              You have no links yet.
            </div>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-6">
            <div className="text-white/70">Total Links</div>
            <div className="text-4xl font-extrabold text-white mt-1">{stats.totalLinks}</div>
          </div>
          <div className="card p-6">
            <div className="text-white/70">Total Clicks</div>
            <div className="text-4xl font-extrabold text-white mt-1">{stats.totalClicks}</div>
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="card p-6">
          <div className="text-white/80">Account Settings</div>
          <div className="text-white/60 text-sm mt-2">
            Manage your Supabase account details in your authentication provider.
          </div>
          <div className="mt-4">
            <button
              onClick={async () => {
                const { data, error } = await supabase.auth.updateUser({
                  data: { theme: "dark" }
                });
                if (error) alert(error.message);
                else alert("Saved a sample preference on your profile metadata.");
              }}
              className="btn btn-secondary px-4 py-2"
            >
              Save Preference
            </button>
          </div>
        </div>
      )}

      <AddEditLinkModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        initial={editTarget}
        onSubmit={handleSave}
        loading={busy}
      />
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        loading={busy}
        text={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
