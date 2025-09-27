# Backend + Database Integration Steps

1) Configure Supabase
- Create a Supabase project.
- In SQL editor, run the schema and policy script from express_backend/README.md.
- Ensure the RPC function increment_clicks is created if you want public click tracking without auth.
- Confirm RLS policies as written or adapt to your needs.

2) Populate environment variables
- Frontend .env (already used by the app):
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_KEY
  - REACT_APP_SITE_URL (optional for email confirm redirect)
- Backend .env (express_backend/.env):
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_KEY (anon or service role; with RLS anon is sufficient)
  - PORT=4000
  - CORS_ORIGINS=http://localhost:3000

3) Start services locally
- Backend:
  - cd link-organizer-16898-17616/express_backend
  - npm install
  - npm run dev
- Frontend:
  - cd link-organizer-16898-17616/react_frontend
  - npm install
  - npm start
- Frontend should call the backend using http://localhost:4000 and send the Supabase JWT in Authorization header.

4) Frontend service migration (optional)
- The current React app talks directly to Supabase (src/supabase/linksService.js).
- To migrate to backend API:
  - Replace Supabase calls with fetch calls to the Express endpoints.
  - Always include Authorization: Bearer <access_token> in protected requests:
    ```js
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    ```
  - Keep the public redirect page pointing to POST /links/:id/click (no auth).

5) Production considerations
- Deploy backend and frontend to your hosting platforms.
- Set env vars in each environment.
- Restrict CORS to your production domain.
- Add a rate limiter and robust logging.
