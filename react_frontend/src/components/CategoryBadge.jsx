import React from "react";

// PUBLIC_INTERFACE
export default function CategoryBadge({ category }) {
  /** Colored badge for category. */
  return (
    <span className="badge badge-muted">
      {category}
    </span>
  );
}
