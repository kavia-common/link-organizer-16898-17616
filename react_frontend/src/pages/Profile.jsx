import React from 'react';
import BrandSettings from '../components/BrandSettings';

export default function Profile() {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Profile</h1>
      <div className="grid gap-4">
        <section className="rounded-lg p-4 border border-white/10 surface" aria-labelledby="profile-info-title">
          <h2 id="profile-info-title" className="font-semibold mb-2">My Links & Analytics</h2>
          <p className="opacity-90">My Links, Analytics and Settings will appear here.</p>
        </section>
        <BrandSettings />
      </div>
    </div>
  );
}
