import React, { useState } from "react";

export default function Sidebar({ categories, selectedCategory, onSelect, sort, onSort }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sortOptions = [
    { value: "newest", label: "Newest First", icon: "🆕" },
    { value: "oldest", label: "Oldest First", icon: "📅" },
    { value: "most_clicked", label: "Most Popular", icon: "🔥" },
    { value: "title", label: "Alphabetical", icon: "🔤" }
  ];

  const allCategories = ["All", ...categories];
  const categoryCount = (cat) => {
    if (cat === "All") return categories.length;
    return 1; // In a real app, you'd count links per category
  };

  return (
    <aside className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-72'}`}>
      <div className="sticky top-20">
        {/* Collapse/Expand button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 z-10 w-6 h-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-lg"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm overflow-hidden">
          {isCollapsed ? (
            // Collapsed view - Icon only
            <div className="p-4 space-y-4">
              {/* Categories icon */}
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-xl mx-auto">
                <span className="text-xl">📁</span>
              </div>
              
              {/* Sort icon */}
              <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-xl mx-auto">
                <span className="text-xl">
                  {sortOptions.find(opt => opt.value === sort)?.icon || "🔤"}
                </span>
              </div>
            </div>
          ) : (
            // Expanded view - Full content
            <div className="p-5">
              {/* Categories section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className="text-lg">📁</span>
                    Categories
                  </h3>
                  <span className="text-xs text-zinc-500 bg-zinc-950 px-2 py-1 rounded-full border border-zinc-800">
                    {allCategories.length}
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  {allCategories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => onSelect(cat)}
                        className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                            : "bg-zinc-950/50 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {cat === "All" ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${
                              isSelected ? "bg-white" : "bg-zinc-600 group-hover:bg-blue-400"
                            }`} />
                          )}
                          <span className="font-medium text-sm truncate">
                            {cat}
                          </span>
                        </div>
                        {isSelected && (
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-zinc-900/50 text-zinc-600 text-xs">•</span>
                </div>
              </div>

              {/* Sort section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className="text-lg">🔀</span>
                    Sort By
                  </h3>
                </div>
                
                <div className="space-y-1.5">
                  {sortOptions.map((option) => {
                    const isSelected = sort === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => onSort(option.value)}
                        className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isSelected
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                            : "bg-zinc-950/50 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{option.icon}</span>
                          <span className="font-medium text-sm">
                            {option.label}
                          </span>
                        </div>
                        {isSelected && (
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats card */}
              <div className="mt-6 p-4 bg-black/40 border border-zinc-800 rounded-xl">
                <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                  Quick Stats
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Total Categories</span>
                    <span className="font-bold text-white">{categories.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Current Filter</span>
                    <span className="font-bold text-blue-400 truncate max-w-[100px]">
                      {selectedCategory}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom action */}
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-950/50 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all text-sm font-medium group">
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help hint */}
        {!isCollapsed && (
          <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-2 text-xs text-blue-400">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Click on any category to filter your links instantly</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}