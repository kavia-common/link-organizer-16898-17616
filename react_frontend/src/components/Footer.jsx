import React from "react";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 py-6 text-sm text-center surface" role="contentinfo">
      <p className="opacity-80">© {new Date().getFullYear()} Link Hub</p>
    </footer>
  );
}
