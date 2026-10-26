-- Run once in Supabase → SQL Editor if E2E or the app shows
-- "Something went wrong" on alert signup, or logs:
--   permission denied for table job_alert_subscribers
--
-- The Next.js app and Playwright helpers use the service role key
-- (SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY). RLS stays enabled;
-- service_role bypasses RLS but still needs table privileges.

grant usage on schema public to service_role;

grant select, insert, update, delete
  on table public.job_alert_subscribers
  to service_role;

grant select, insert, update, delete
  on table public.job_alert_attempts
  to service_role;
