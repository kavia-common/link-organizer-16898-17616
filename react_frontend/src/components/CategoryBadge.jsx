import React from "react";

// PUBLIC_INTERFACE
export default function CategoryBadge({ category }) {
  /** Colored badge for category. */
  const label = (category || "General")
    .toString()
    .split(" ")
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  return (
    <span className="badge badge-muted">
      {label}
    </span>
  );
}
