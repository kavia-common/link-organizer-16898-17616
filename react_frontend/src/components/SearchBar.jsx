import React from 'react';

export default function SearchBar() {
  const inputId = 'global-search';
  return (
    <form className="w-full" role="search" aria-label="Search links">
      <label htmlFor={inputId} className="sr-only">Search links</label>
      <input
        id={inputId}
        className="w-full px-3 py-2 rounded"
        placeholder="Search links..."
        style={{ background: 'var(--surface-color)', color: 'var(--text-color)', border: '1px solid rgba(255,255,255,0.12)' }}
        type="search"
      />
    </form>
  );
}
