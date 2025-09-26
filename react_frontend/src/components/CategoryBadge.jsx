import React from "react";

// PUBLIC_INTERFACE
export default function CategoryBadge({ category }) {
  /** Colored badge for category. */
  return (
    <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/80">
      {category}
    </span>
  );
}
