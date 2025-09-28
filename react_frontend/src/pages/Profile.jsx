import React, { useEffect, useState } from "react";
import { useSupabase } from "../supabase/SupabaseProvider";
import { useLinksService } from "../supabase/linksService";
import LinkCard from "../components/LinkCard";
import { AddEditLinkModal, ConfirmModal } from "../components/Modals";

export default function Profile() {
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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const reload = async () => {
    setLoading(true);
    try {
      const [ls, an] = await Promise.all([
        listByUser({}),
        analytics()
      ]);
      setLinks(ls || []);
      setStats(an || { totalLinks: 0, totalClicks: 0 });
    } catch (e) {
      console.error("Failed to load profile data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };
    getUser();
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

  const topLinks = [...links]
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 5);

  const avgClicks = links.length > 0 
    ? (stats.totalClicks / links.length).toFixed(1)
    : 0;

  const tabs = [
    { id: "links", label: "My Links", icon: "🔗" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-blue-500/30">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-black flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {user?.user_metadata?.full_name || "Your Profile"}
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base mb-3">
                {user?.email || "Loading..."}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
                  Pro Member
                </span>
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-medium">
                  {links.length} Links Saved
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 p-1.5 bg-zinc-950 rounded-xl border border-zinc-800 w-fit">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  tab === t.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {tab === t.id && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="page-enter">
          {/* My Links Tab */}
          {tab === "links" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">All Your Links</h2>
                <span className="text-sm text-zinc-400">
                  {links.length} total
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <svg className="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 border border-zinc-800 rounded-2xl backdrop-blur-sm">
                  <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No links yet</h3>
                  <p className="text-zinc-400 text-center max-w-md">
                    Start building your collection by adding links from the Dashboard
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {links.map((link, idx) => (
                    <div 
                      key={link.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${idx * 40}ms` }}
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
          )}

          {/* Analytics Tab */}
          {tab === "analytics" && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🔗</span>
                        </div>
                      </div>
                      <div className="text-zinc-400 text-sm font-medium mb-1">Total Links</div>
                      <div className="text-4xl font-bold text-white">{stats.totalLinks}</div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-xl">👆</span>
                        </div>
                      </div>
                      <div className="text-zinc-400 text-sm font-medium mb-1">Total Clicks</div>
                      <div className="text-4xl font-bold text-white">{stats.totalClicks}</div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-green-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📈</span>
                        </div>
                      </div>
                      <div className="text-zinc-400 text-sm font-medium mb-1">Avg Clicks/Link</div>
                      <div className="text-4xl font-bold text-white">{avgClicks}</div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-orange-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-xl">⭐</span>
                        </div>
                      </div>
                      <div className="text-zinc-400 text-sm font-medium mb-1">Most Popular</div>
                      <div className="text-2xl font-bold text-white truncate">
                        {topLinks[0]?.clicks || 0} clicks
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Links */}
              {topLinks.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Top Performing Links</h2>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm overflow-hidden">
                    {topLinks.map((link, idx) => (
                      <div 
                        key={link.id}
                        className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-all border-b border-zinc-800 last:border-b-0"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="text-2xl font-bold text-zinc-600 w-8">
                            #{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate mb-1">
                              {link.title}
                            </div>
                            <div className="text-xs text-zinc-500 truncate">
                              {link.url}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {link.clicks || 0}
                            </div>
                            <div className="text-xs text-zinc-400">clicks</div>
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {tab === "settings" && (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Account Information</h3>
                    <p className="text-zinc-400 text-sm">
                      Manage your account details and preferences
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Email cannot be changed from this interface
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={user?.id || ""}
                      disabled
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm opacity-60 cursor-not-allowed font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Preferences</h3>
                    <p className="text-zinc-400 text-sm">
                      Customize your LinkHub experience
                    </p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase.auth.updateUser({
                        data: { theme: "dark", updated_at: new Date().toISOString() }
                      });
                      if (error) throw error;
                      alert("✅ Preferences saved successfully!");
                    } catch (e) {
                      alert("❌ " + (e.message || "Failed to save preferences"));
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 active:scale-95"
                >
                  Save Preferences
                </button>
              </div>

              <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-red-300/70 text-sm mb-4">
                      Irreversible actions that affect your account
                    </p>
                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to sign out?")) {
                          await supabase.auth.signOut();
                          window.location.href = "/";
                        }
                      }}
                      className="px-6 py-2 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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

      {/* Animation styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}