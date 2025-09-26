import React from "react";

// PUBLIC_INTERFACE
export default function Sidebar({ categories, selectedCategory, onSelect, sort, onSort }) {
  /** Collapsible sidebar with categories and sorting (visible on lg+). */
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="card p-5 sticky top-24">
        <h3 className="text-white/90 font-bold mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => onSelect(c)}
              className={`px-3 py-1.5 rounded-full border transition ${
                selectedCategory === c
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-soft"
                  : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <h3 className="text-white/90 font-bold mb-2">Sort</h3>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_clicked">Most clicked</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
