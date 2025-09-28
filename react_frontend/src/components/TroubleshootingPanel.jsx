import React from 'react';

export default function TroubleshootingPanel() {
  return (
    <section className="rounded-lg p-4 border border-white/10 surface" aria-labelledby="troubleshooting-title">
      <h3 id="troubleshooting-title" className="font-semibold mb-2">Troubleshooting</h3>
      <ul className="list-disc pl-4 text-sm opacity-90">
        <li>Ensure you are logged in.</li>
        <li>Check your Supabase configuration.</li>
        <li>Network requests require backend running.</li>
      </ul>
    </section>
  );
}
