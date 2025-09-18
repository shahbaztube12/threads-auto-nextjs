# TODO: Fix Supabase Edge Runtime Error for Vercel Deployment

## Tasks
- [x] Add `export const runtime = "nodejs";` to `lib/supabase/middleware.ts` to force Node.js runtime for middleware using Supabase server client.
- [x] Check and update any API routes using Supabase server client with `export const runtime = "nodejs";`.
- [x] Verify that browser client (`lib/supabase/client.ts`) remains unchanged for client-side usage.
- [ ] Redeploy to Vercel to test the fix.
- [ ] Confirm the app works at http://threads-1yod.vercel.app/

## Notes
- The error occurs because Supabase packages use Node.js APIs (e.g., `process.versions`) not supported in Edge Runtime.
- Middleware runs in Edge Runtime by default in Next.js 14+.
- Adding `export const runtime = "nodejs";` forces the route/middleware to use Node.js runtime.
- Browser client (`createBrowserClient`) is fine for client-side as it doesn't use Node.js APIs.
