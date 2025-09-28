import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * PUBLIC_INTERFACE
 * BrandSettings allows selecting accent color and brand logo URL at runtime.
 * This persists via ThemeProvider (localStorage) and updates CSS variables dynamically.
 */
export default function BrandSettings() {
  const { accent, setAccent, brand, setBrand } = useTheme();
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl || '');
  const [name, setName] = useState(brand.name || 'Link Hub');

  return (
    <form className="rounded-lg p-4 border border-white/10 surface" onSubmit={(e) => e.preventDefault()} aria-labelledby="brand-settings-title">
      <h3 id="brand-settings-title" className="font-semibold mb-3">Brand & Accent</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="accent" className="block text-sm mb-1">Accent color</label>
          <input
            id="accent"
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            aria-describedby="accent-help"
            className="w-16 h-10 p-1 rounded border"
            style={{ background: 'var(--surface-color)' }}
          />
          <div id="accent-help" className="text-xs opacity-80 mt-1">Used for buttons, badges, and highlights.</div>
        </div>
        <div>
          <label htmlFor="brandName" className="block text-sm mb-1">Brand name</label>
          <input
            id="brandName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="logoUrl" className="block text-sm mb-1">Logo URL</label>
          <input
            id="logoUrl"
            type="url"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full"
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setBrand({ name, logoUrl })}
            >
              Save
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setLogoUrl('');
                setName('Link Hub');
                setBrand({ name: 'Link Hub', logoUrl: '' });
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
