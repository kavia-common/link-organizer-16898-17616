import React, { useEffect } from "react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg sm:mx-0 mx-3">
        {/* Glow border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20" />
        <div className="relative card p-5 translate-y-0 animate-[fadeIn_0.2s_ease]">
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
    </div>
  );
}

// PUBLIC_INTERFACE
export function AddEditLinkModal({ open, onClose, initial, onSubmit, loading }) {
  /** Modal for adding or editing a link. */
  const [form, setForm] = React.useState(
    initial || { title: "", url: "", description: "", category: "General", notes: "" }
  );
  const [err, setErr] = React.useState("");

  useEffect(() => {
    setForm(initial || { title: "", url: "", description: "", category: "General", notes: "" });
    setErr("");
  }, [initial, open]);

  function normalizeUrl(u = "") {
    const val = String(u).trim();
    if (!val) return "";
    // If missing scheme, prefix with https://
    if (!/^https?:\/\//i.test(val)) {
      return `https://${val}`;
    }
    return val;
  }

  const validate = () => {
    const title = (form.title || "").trim();
    const url = normalizeUrl(form.url || "");
    if (!title) {
      setErr("Title is required");
      return { ok: false };
    }
    try {
      // Validate URL with URL API and require http/https scheme
      const u = new URL(url);
      if (!/^https?$/.test(u.protocol.replace(":", ""))) throw new Error("Invalid protocol");
    } catch {
      setErr("Please provide a valid URL starting with http:// or https://");
      return { ok: false };
    }
    setErr("");
    return { ok: true, values: { ...form, title, url } };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (!v.ok) return;
    try {
      if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug("[AddEditLinkModal] submit", { mode: process.env.REACT_APP_API_BASE ? "backend" : "direct-supabase", values: { ...v.values, notes: v.values?.notes ? "(len)" : "" } });
      }
      await onSubmit(v.values);
      setErr("");
    } catch (submitErr) {
      if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("[AddEditLinkModal] submit failed", submitErr);
      }
      setErr(submitErr?.message || "Failed to save link");
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title={initial ? "Edit Link" : "Add Link"}>
      {err && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/40 rounded text-red-300 text-sm">
          {err}
        </div>
      )}
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
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-white/80 text-sm mb-1">Notes (Markdown)</label>
            <span className="text-xs text-white/40">Supports headings, lists, code, links</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-white/10">
            <SimpleMDE
              value={form.notes || ""}
              onChange={(val) => setForm({ ...form, notes: val })}
              options={{
                status: false,
                placeholder: "Write detailed notes in markdown...\n\nSupports:\n- **Bold** and *italic*\n- # Headers\n- Lists and checkboxes\n- `Code` and ```code blocks```\n- > Blockquotes\n- Links and images\n- Tables (via GFM)",
                spellChecker: false,
                autofocus: false,
                autosave: { enabled: false },
                renderingConfig: { codeSyntaxHighlighting: true },
                toolbar: [
                  "bold", "italic", "heading", "|",
                  "quote", "unordered-list", "ordered-list", "|",
                  "link", "image", "table", "|",
                  "preview", "side-by-side", "fullscreen", "|",
                  "guide"
                ],
                // EasyMDE internally does element.classList.add(previewClass). When previewClass is a
                // space-separated string, this results in DOMTokenList InvalidCharacterError.
                // Pass an array so EasyMDE adds each class token correctly.
                previewClass: ["prose", "prose-invert", "max-w-none"],
                minHeight: "200px"
              }}
            />
          </div>
        </div>
        <div className="pt-2 flex gap-2 justify-between items-center">
          {/* Diagnostics note (dev-time hint) */}
          <div className="text-[10px] text-white/40">
            Mode: {process.env.REACT_APP_API_BASE ? "backend" : "direct-supabase"} • Check DevTools console/network if save fails.
          </div>
          <div className="flex gap-2">
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
          className="px-4 py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white border border-white/10"
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </BaseModal>
  );
}
