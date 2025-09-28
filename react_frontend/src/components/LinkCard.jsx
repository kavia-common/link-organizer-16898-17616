import React from 'react';
import CategoryBadge from './CategoryBadge';

export default function LinkCard({ link }) {
  return (
    <article className="rounded-lg p-4 border border-white/10 surface" aria-labelledby={`card-${link.id}-title`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`card-${link.id}-title`} className="font-semibold">{link.title}</h3>
          {link.description && <p className="opacity-90 text-sm mt-1">{link.description}</p>}
          <div className="mt-2">
            <CategoryBadge category={link.category} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={link.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer" aria-label={`Open ${link.title}`}>
            Open
          </a>
        </div>
      </div>
    </article>
  );
}
