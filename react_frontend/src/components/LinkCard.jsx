import React from "react";
import { Link as RouterLink } from "react-router-dom";
import CategoryBadge from "./CategoryBadge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// PUBLIC_INTERFACE
export default function LinkCard({ link, onEdit, onDelete }) {
  /** Card for a single link (title, desc, category, clicks, open, edit, delete). */
  return (
    <div className="card p-5 group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl relative overflow-hidden">
      {/* Accent gradient strip */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-blue-600/50" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-white font-bold truncate">{link.title}</h3>
          <p className="text-white/60 text-sm mt-1 line-clamp-2">{link.description}</p>
        </div>
        <CategoryBadge category={link.category || "General"} />
      </div>
      {/* Markdown notes */}
      {link.notes && link.notes.trim().length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 overflow-hidden transition-all duration-200 hover:border-white/20">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-3 mb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white/90 mt-3 mb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-base font-semibold text-white/90 mt-3 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-white/70 text-sm leading-relaxed mb-3" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 hover:underline break-words transition-colors" target="_blank" rel="noreferrer" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 text-white/70 text-sm space-y-1.5 mb-3" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 text-white/70 text-sm space-y-1.5 mb-3" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-blue-500/50 pl-4 my-3 text-white/60 italic" {...props} />,
              hr: ({node, ...props}) => <hr className="my-4 border-white/10" {...props} />,
              code: ({inline, className, children, ...props}) =>
                inline ? (
                  <code className="bg-black/40 text-blue-300 px-1.5 py-0.5 rounded font-mono text-[13px]" {...props}>{children}</code>
                ) : (
                  <pre className="my-3 bg-black/50 text-white/80 p-4 rounded-lg overflow-x-auto font-mono text-sm border border-white/5" {...props}>
                    <code>{children}</code>
                  </pre>
                )
            }}
          >
            {link.notes}
          </ReactMarkdown>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-white/50 text-sm">Clicks: {link.clicks || 0}</div>
        <div className="flex items-center gap-2">
          <RouterLink
            to={`/r/${link.id}`}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-soft hover:shadow-blue-500/40 transition-all"
            target="_self"
          >
            Open
          </RouterLink>
          <button
            onClick={() => onEdit(link)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(link)}
            className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white border border-white/10"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
