-- Supabase setup script: links table, RLS, policies, and RPC
-- Run this in the Supabase SQL editor or via Supabase CLI:
-- supabase link --project-ref <your-project-ref>
-- supabase db query < link-organizer-16898-17616/assets/supabase_setup.sql

-- 1) Ensure required extension for gen_random_uuid
create extension if not exists pgcrypto;

-- 2) Create links table (as provided)
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

comment on table public.links is 'User-owned links saved in the app.';
comment on column public.links.user_id is 'Owner user id from auth.users';
comment on column public.links.clicks is 'Click counter for the link';

-- 3) Enable Row Level Security
alter table public.links enable row level security;

-- 4) Policies
-- Allow authenticated users to insert their own rows
drop policy if exists "Users can insert their own links" on public.links;
create policy "Users can insert their own links"
  on public.links
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow owners to select their rows
drop policy if exists "Users can read their own links" on public.links;
create policy "Users can read their own links"
  on public.links
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow owners to update their rows
drop policy if exists "Users can update their own links" on public.links;
create policy "Users can update their own links"
  on public.links
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow owners to delete their rows
drop policy if exists "Users can delete their own links" on public.links;
create policy "Users can delete their own links"
  on public.links
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- If you have a redirect page that needs to increment clicks without exposing user_id,
-- you can create a function and policy to allow rpc execution by authenticated users.

-- 5) RPC: increment_clicks
create or replace function public.increment_clicks(link_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.links
    set clicks = clicks + 1
  where id = link_id;
end;
$$;

comment on function public.increment_clicks(uuid) is 'Increments the click counter for a link id';

-- 5.a) Restrict RPC usage: Allow only owners of the link to call increment_clicks
-- This uses a policy on update because function performs an update.
drop policy if exists "Only owners can increment their link clicks" on public.links;
create policy "Only owners can increment their link clicks"
  on public.links
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6) Helpful grants (Supabase usually manages these groups)
grant usage on schema public to authenticated, anon;
grant execute on function public.increment_clicks(uuid) to authenticated;

-- 7) Indexes for performance (optional but recommended)
create index if not exists idx_links_user_id on public.links(user_id);
create index if not exists idx_links_created_at on public.links(created_at desc);
create index if not exists idx_links_category on public.links(category);

-- 8) Verification queries (safe to run)
-- select * from public.links limit 1;
-- select has_table_privilege(auth.uid(), 'public.links', 'select');
-- select proname from pg_proc where proname = 'increment_clicks';

-- End of script
