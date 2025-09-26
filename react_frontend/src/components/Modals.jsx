import React, { useEffect } from "react";

function BaseModal({ open, onClose, children, title }) {
  // Always call hooks; conditionally render markup
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg card p-5 sm:mx-0 mx-3 translate-y-0 animate-[fadeIn_0.2s_ease]">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function AddEditLinkModal({ open, onClose, initial, onSubmit, loading }) {
  /** Modal for adding or editing a link. */
  const [form, setForm] = React.useState(
    initial || { title: "", url: "", description: "", category: "General" }
  );

  useEffect(() => {
    setForm(initial || { title: "", url: "", description: "", category: "General" });
  }, [initial, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <BaseModal open={open} onClose={onClose} title={initial ? "Edit Link" : "Add Link"}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-white/80 text-sm mb-1">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2"
            placeholder="e.g. React Docs"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-1">URL</label>
          <input
            required
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full px-3 py-2"
            placeholder="https://react.dev"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-1">Category</label>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2"
            placeholder="Docs, GitHub, Blog, Tutorial..."
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2"
            placeholder="Short summary..."
          />
        </div>
        <div className="pt-2 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-4 py-2" disabled={loading}>
            {loading ? "Saving..." : initial ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// PUBLIC_INTERFACE
export function ConfirmModal({ open, onClose, onConfirm, text = "Are you sure?", loading }) {
  /** Minimal confirm modal for deletions. */
  return (
    <BaseModal open={open} onClose={onClose} title="Confirm">
      <div className="text-white/80">{text}</div>
      <div className="pt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-error text-white"
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </BaseModal>
  );
}
