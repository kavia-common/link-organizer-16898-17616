import React from 'react';

export default function CategoryBadge({ category }) {
  return (
    <span
      className="inline-block text-xs px-2 py-1 rounded mt-2"
      style={{
        background: 'color-mix(in srgb, var(--accent-color) 15%, transparent)',
        border: '1px solid var(--accent-color)',
        color: 'var(--text-color)'
      }}
      aria-label={`Category: ${category}`}
    >
      {category}
    </span>
  );
}
