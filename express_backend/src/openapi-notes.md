# LinkHub API Notes

Base URL: http://localhost:4000

Security:
- Bearer token (Supabase JWT). Obtain from supabase.auth.getSession() on the frontend.

Endpoints:
- GET /links?search=&category=&sort=&limit=&offset=
- POST /links { title, url, description?, category?, notes? }
- PATCH /links/:id { ...patch }
- DELETE /links/:id
- GET /links/analytics/summary
- GET /links/:id
- GET /categories
- POST /links/:id/click (public)
