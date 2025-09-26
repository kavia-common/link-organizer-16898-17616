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
        className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="absolute left-3 top-2.5 text-white/50">🔎</div>
    </div>
  );
}
