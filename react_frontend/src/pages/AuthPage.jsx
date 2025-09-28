import React from 'react';

export default function AuthPage() {
  return (
    <section className="max-w-md mx-auto p-4 surface rounded-lg border border-white/10" aria-labelledby="auth-title">
      <h1 id="auth-title" className="text-xl font-semibold mb-4">Login</h1>
      <p className="opacity-90">Authenticate with Supabase here.</p>
    </section>
  );
}
