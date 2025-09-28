import React from 'react';
import LinkCard from '../components/LinkCard';

export default function Dashboard() {
  const mock = [
    { id: '1', title: 'GitHub', url: 'https://github.com', description: 'Code hosting platform', category: 'Docs' },
    { id: '2', title: 'MDN', url: 'https://developer.mozilla.org', description: 'Developer docs', category: 'Docs' },
    { id: '3', title: 'React', url: 'https://react.dev', description: 'React docs', category: 'Framework' },
  ];
  return (
    <section className="max-w-7xl mx-auto" aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className="text-xl font-semibold mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
        {mock.map((l) => (
          <div role="listitem" key={l.id}>
            <LinkCard link={l} />
          </div>
        ))}
      </div>
    </section>
  );
}
