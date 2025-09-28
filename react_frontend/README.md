# Link/Resource Hub — React Frontend

A dark, bold, GitHub-inspired React app with Supabase authentication, Tailwind styling, link management (CRUD), analytics, and a minimal redirect page that increments click counts.

## Features

- Supabase email/password auth (login, logout, registration)
- Dashboard with responsive grid (3/2/1 columns) and collapsible sidebar
- Search (navbar), filters, sorting, category badges
- Add/Edit/Delete links via animated modals
- Markdown notes per link: write in editor (SimpleMDE) and render with react-markdown (GFM)
- Profile page with tabs: My Links, Analytics (total links, clicks), Settings
- Minimal redirect page that increments click counter then navigates
- TailwindCSS dark theme with primary #ff7614 and secondary #27d39a
- Fixed top navbar and simple footer

## Environment

Create a `.env` with:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_KEY=your_supabase_anon_key
# Optional for email confirmation redirect
REACT_APP_SITE_URL=http://localhost:3000
# Optional: surfaced in Website Vitals (Advanced)
REACT_APP_BUILD_HASH=$(git rev-parse --short HEAD)
REACT_APP_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
# If using the Express backend (to enable /health and proxy features)
REACT_APP_API_BASE=http://localhost:4000
```

## Getting Started

```
npm install
npm start
```

## Supabase Schema

Create table `links`:

- id: uuid (PK, default uuid_generate_v4())
- user_id: uuid (FK to auth.users.id, row level security)
- title: text
- url: text
- description: text
- category: text
- notes: text (markdown)
- clicks: bigint (default 0)
- created_at: timestamptz default now()

Enable RLS and policies to allow users to read/write their own rows and read public rows for redirect route.

