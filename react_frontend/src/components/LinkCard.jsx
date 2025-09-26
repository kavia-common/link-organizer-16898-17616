import React from "react";
import { Link as RouterLink } from "react-router-dom";
import CategoryBadge from "./CategoryBadge";

// PUBLIC_INTERFACE
export default function LinkCard({ link, onEdit, onDelete }) {
  /** Card for a single link (title, desc, category, clicks, open, edit, delete). */
  return (
    <div className="card p-4 group transition hover:translate-y-[-1px] hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-white font-bold truncate">{link.title}</h3>
          <p className="text-white/60 text-sm mt-1 line-clamp-2">{link.description}</p>
        </div>
        <CategoryBadge category={link.category || "General"} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-white/50 text-sm">Clicks: {link.clicks || 0}</div>
        <div className="flex items-center gap-2">
          <RouterLink
            to={`/r/${link.id}`}
            className="btn btn-secondary px-3 py-1.5"
            target="_self"
          >
            Open
          </RouterLink>
          <button
            onClick={() => onEdit(link)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(link)}
            className="px-3 py-1.5 rounded-lg bg-error/80 hover:bg-error text-white border border-white/10"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
