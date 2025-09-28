# LinkHub Express Backend

Express.js backend that integrates with Supabase for authentication and storage. It exposes REST endpoints for managing links, derived categories, analytics, and a public click tracker.

## Env

Copy `.env.example` to `.env` and set:

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY (anon is fine with proper RLS; service role also works but be cautious)
- PORT (default 4000)
- CORS_ORIGINS (comma-separated, e.g., http://localhost:3000)

## Run

```
npm install
npm run dev
```

Server: http://localhost:4000

### Health
GET /health -> 200 OK with JSON
{
  "status": "ok|degraded|down",
  "service": "linkhub-backend",
  "time": "ISO",
  "latency_ms": number,
  "db": true|false,
  "details": { ... },
  "env": { "supabaseConfigured": boolean },
  "cors": { "allowedOrigins": string[] }
}
Use this in the frontend diagnostics to surface DB health and network/CORS configuration.

## Authentication

- All protected endpoints require `Authorization: Bearer <supabase_jwt>` from the React frontend (via supabase.auth.getSession()).
- The middleware verifies the JWT with Supabase and attaches `req.user`.

## Endpoints

Protected (require Bearer token):
- GET /links?search=&category=&sort=&limit=&offset=
- POST /links { title, url, description?, category?, notes? }
- PATCH /links/:id { ...patch }
- DELETE /links/:id
- GET /links/analytics/summary -> { totalLinks, totalClicks }
- GET /categories -> [{ name, count }]
- GET /links/:id -> returns a single link only if owned by the user

Public (no auth):
- POST /links/:id/click -> increments click count and returns { clicks, url }
  - Requires Supabase RLS policies or an RPC to allow public increment. See SQL below.

## Database (Supabase)

Run these SQL statements (adapt as needed):

```sql
-- Enable UUID and gen_random_uuid if not enabled
-- create extension if not exists "pgcrypto";

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  description text,
  category text,
  notes text,
  clicks bigint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.links enable row level security;

create policy "Users can view own links"
on public.links for select
using (auth.uid() = user_id);

create policy "Users can insert own links"
on public.links for insert
with check (auth.uid() = user_id);

create policy "Users can update own links"
on public.links for update
using (auth.uid() = user_id);

create policy "Users can delete own links"
on public.links for delete
using (auth.uid() = user_id);

-- Public click tracking for redirect:
-- Option A: RPC with security definer
create or replace function public.increment_clicks(link_id uuid)
returns void as $$
begin
  update public.links set clicks = coalesce(clicks,0) + 1 where id = link_id;
end;
$$ language plpgsql security definer;

grant execute on function public.increment_clicks(uuid) to anon;

-- Allow anon to select minimal fields for redirect page
create policy "Allow anon select link for redirect"
on public.links for select
to anon
using (true);
```

Notes:
- If you prefer not to allow anon select, change the backend public endpoint to only return clicks count and fetch the URL on the client another way, or restrict fields with a view.

## Frontend Integration

The existing React frontend uses Supabase directly. You can switch to this backend by routing API calls to:
- Base URL: http://localhost:4000

Auth:
- Extract JWT from Supabase session:
  ```js
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  ```

Examples:
- List links:
  ```js
  fetch(`/links?search=${encodeURIComponent(q)}`, { headers })
  ```
- Create:
  ```js
  fetch("/links", { method: "POST", headers, body: JSON.stringify({ title, url, ... }) })
  ```
- Update:
  ```js
  fetch(`/links/${id}`, { method: "PATCH", headers, body: JSON.stringify(patch) })
  ```
- Delete:
  ```js
  fetch(`/links/${id}`, { method: "DELETE", headers })
  ```
- Analytics:
  ```js
  fetch("/links/analytics/summary", { headers })
  ```
- Categories:
  ```js
  fetch("/categories", { headers })
  ```
- Public click increment (no auth):
  ```js
  fetch(`/links/${id}/click`, { method: "POST" })
  ```

## Security Best Practices

- Keep service role key out of the browser. If you use a service role in backend, ensure RLS/policies still defend against misuse.
- Validate inputs (Joi is used).
- Helmet for basic hardening; consider rate limiting in production.
- Only allow CORS from known origins.

## Deployment Tips

- Supply env vars via your platform secret manager.
- Serve behind HTTPS and a reverse proxy (e.g., Nginx).
- Add logging/monitoring.
