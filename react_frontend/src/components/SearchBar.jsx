import React from "react";

// PUBLIC_INTERFACE
export default function SearchBar({ value, onChange }) {
  /** Search input used in navbar; broadcasts changes via onChange. */
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search links..."
        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent shadow-sm transition"
      />
      <div className="pointer-events-none absolute left-3 top-2.5 text-white/50">🔎</div>
    </div>
  );
}
