import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import CategoryBadge from "./CategoryBadge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function LinkCard({ link, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasNotes = link.notes && link.notes.trim().length > 0;
  
  return (
    <div className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
      {/* Top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Card content */}
      <div className="p-5">
        {/* Header section */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
              {link.title}
            </h3>
            <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
              {link.description || "No description provided"}
            </p>
          </div>
          <CategoryBadge category={link.category || "General"} />
        </div>

        {/* URL display */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-black/30 border border-zinc-800 rounded-lg group/url">
          <svg className="w-4 h-4 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-blue-400 truncate transition-colors flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            {link.url}
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(link.url);
              // Could show a toast notification here
            }}
            className="opacity-0 group-hover/url:opacity-100 p-1 hover:bg-zinc-800 rounded transition-all"
            title="Copy URL"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Markdown notes */}
        {hasNotes && (
          <div className="mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-2"
            >
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {isExpanded ? 'Hide' : 'Show'} Notes
            </button>
            
            {isExpanded && (
              <div className="p-4 rounded-lg bg-black/40 border border-zinc-800 backdrop-blur-sm animate-slide-down">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-3 mb-2 first:mt-0" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mt-3 mb-2 first:mt-0" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-semibold text-white mt-3 mb-2 first:mt-0" {...props} />,
                    p: ({node, ...props}) => <p className="text-zinc-300 text-sm leading-relaxed mb-3 last:mb-0" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 hover:underline break-words transition-colors" target="_blank" rel="noreferrer" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 text-zinc-300 text-sm space-y-1 mb-3" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 text-zinc-300 text-sm space-y-1 mb-3" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-blue-500 pl-4 my-3 text-zinc-400 italic" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-4 border-zinc-700" {...props} />,
                    code: ({inline, className, children, ...props}) =>
                      inline ? (
                        <code className="bg-zinc-950 text-blue-400 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>
                      ) : (
                        <pre className="my-3 bg-zinc-950 text-zinc-300 p-4 rounded-lg overflow-x-auto font-mono text-sm border border-zinc-800" {...props}>
                          <code>{children}</code>
                        </pre>
                      )
                  }}
                >
                  {link.notes}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Stats and metadata */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span className="font-medium">{link.clicks || 0} clicks</span>
          </div>
          
          {link.created_at && (
            <div className="flex items-center gap-1.5 text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(link.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <RouterLink
            to={`/r/${link.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 active:scale-95 group/btn"
            target="_self"
          >
            <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Link
          </RouterLink>
          
          <button
            onClick={() => onEdit(link)}
            className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 hover:border-zinc-600 transition-all group/edit"
            title="Edit link"
          >
            <svg className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(link)}
            className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all group/delete"
            title="Delete link"
          >
            <svg className="w-4 h-4 group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/0 via-purple-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:via-purple-600/10 group-hover:to-blue-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />

      {/* Animation styles */}
      <style>{`
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
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}