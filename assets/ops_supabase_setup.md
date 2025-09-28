# Supabase Setup Instructions

This repository includes a ready-to-run SQL script to provision the `links` table, enable Row Level Security (RLS), define policies, and create the `increment_clicks` RPC function.

## Files
- `assets/supabase_setup.sql` — the complete SQL bootstrap.

## Option A — Run in Supabase Dashboard
1. Open your Supabase project at https://supabase.com/dashboard
2. Go to SQL Editor.
3. Paste the contents of `assets/supabase_setup.sql` and run.
4. Confirm the statements executed successfully (you should see success notices).

## Option B — Run via Supabase CLI (local machine)
Prereqs: Node.js and Supabase CLI.
- Install: `npm i -g supabase`
- Login: `supabase login`
- Link: `supabase link --project-ref <your-project-ref>`
- Run SQL:
  - `supabase db query < link-organizer-16898-17616/assets/supabase_setup.sql` (from repo root)
  - or `supabase db query < assets/supabase_setup.sql` (if your CWD is the container root)

## Frontend Environment Variables
Set these in `react_frontend/.env`:

```
REACT_APP_SUPABASE_URL=<your-supabase-url>
REACT_APP_SUPABASE_KEY=<your-anon-or-service-role-key>
```

Do not commit secrets. Use `.env` locally and deployment secrets in CI/CD.

## Verifying
- Table exists: `select * from public.links limit 1;`
- RLS is enabled: In Table Editor, `RLS Enabled` should be ON.
- RPC exists: `select proname from pg_proc where proname = 'increment_clicks';`

## Notes
- Policies restrict CRUD to the owner (`auth.uid() = user_id`).
- The `increment_clicks` function runs as `security definer` and is constrained via the update policy to the owner.
- Adjust policies if you need public-readable links (e.g., a public read policy).
