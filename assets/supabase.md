# Supabase Integration Guide

This frontend uses Supabase for authentication and database storage.

## Environment Variables

Set the following in the frontend `.env`:

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- REACT_APP_SITE_URL (optional, used for email signup redirect)

## Client Initialization

The client is created in `src/supabase/SupabaseProvider.js`:

- Persists session
- Exposes `signInWithEmail`, `signUpWithEmail`, and `signOut`
- Provides `session` and `sessionLoaded` via React context

## Database Schema

Create table `links`:

```sql
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  description text,
  category text,
  clicks bigint not null default 0,
  created_at timestamptz not null default now()
);
```

Enable Row Level Security (RLS):

```sql
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
```

For the redirect page (`/r/:id`) to increment `clicks` without authentication, either:
- Allow public select/update by adding a separate policy limited to incrementing clicks, or
- Create a Postgres function to increment clicks and expose it via RPC with a policy. Example:

```sql
create or replace function public.increment_clicks(link_id uuid)
returns void as $$
begin
  update public.links set clicks = coalesce(clicks,0) + 1 where id = link_id;
end;
$$ language plpgsql security definer;

grant execute on function public.increment_clicks(uuid) to anon;

create policy "Allow anon select link for redirect"
on public.links for select
to anon
using (true);
```

Adjust security to your needs.

## Usage

- CRUD functions and analytics live in `src/supabase/linksService.js`
- Ensure the `links` table and policies are created before running the app
