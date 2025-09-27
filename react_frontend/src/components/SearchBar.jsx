import React, { useState, useRef, useEffect } from "react";

export default function SearchBar({ value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showShortcutHint, setShowShortcutHint] = useState(true);
  const inputRef = useRef(null);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear and blur
      if (e.key === 'Escape' && isFocused) {
        if (value) {
          onChange('');
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange, isFocused]);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative group">
      {/* Search icon */}
      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-all duration-200 ${
        isFocused ? 'text-blue-400' : 'text-zinc-500'
      }`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          setShowShortcutHint(false);
        }}
        onBlur={() => setIsFocused(false)}
        placeholder="Search links, categories, or tags..."
        className={`
          w-full pl-11 pr-24 py-3
          bg-zinc-950 border rounded-xl
          text-white text-sm placeholder-zinc-500
          focus:outline-none transition-all duration-200
          ${isFocused 
            ? 'border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/20' 
            : 'border-zinc-800 hover:border-zinc-700'
          }
        `}
      />

      {/* Right side: Clear button or Keyboard shortcut */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value ? (
          // Clear button (when there's text)
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all group/clear"
            title="Clear search"
          >
            <svg className="w-4 h-4 group-hover/clear:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          // Keyboard shortcut hint (when empty and not focused)
          !isFocused && showShortcutHint && (
            <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-500 animate-fade-in">
              <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-700 rounded text-[10px] font-mono">
                {navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl'}
              </kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-700 rounded text-[10px] font-mono">
                K
              </kbd>
            </div>
          )
        )}
      </div>

      {/* Search suggestions hint */}
      {isFocused && !value && (
        <div className="absolute left-0 right-0 top-full mt-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-xl animate-slide-down z-50">
          <div className="text-xs text-zinc-500 mb-2 font-medium">SEARCH TIPS</div>
          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">•</span>
              <span>Type to search across all your links</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              <span>Use category names to filter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">•</span>
              <span>Press <kbd className="px-1 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px]">ESC</kbd> to clear</span>
            </div>
          </div>
        </div>
      )}

      {/* Active search indicator */}
      {value && (
        <div className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}