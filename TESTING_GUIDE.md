# Red Deer Jobs — Manual Testing Guide

This document describes end-to-end manual test scenarios for the Next.js app in this repository. Each scenario includes prerequisites, step-by-step instructions, and expected results aligned with the current implementation.

---

## Table of contents

1. [Environment & tooling](#environment--tooling)
2. [Core user scenarios](#core-user-scenarios)
   - [Employer flow (post + pay)](#employer-flow-post--pay)
   - [Employer self-management](#employer-self-management)
   - [Public job board](#public-job-board)
   - [Admin portal](#admin-portal)
3. [Security & data integrity](#security--data-integrity)
4. [Quick reference](#quick-reference)

---

## Environment & tooling

### Prerequisites

- Node.js compatible with Next.js 16 (see `package.json`).
- A Supabase project with a `jobs` table matching the schema in `.cursor/rules/database-rules.mdc`.
- Stripe account (test mode) with Checkout enabled.
- Resend account (test sending).
- Optional: [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhook forwarding.

### Start the app

```bash
npm install
npm run dev
```

Default URL: [http://localhost:3000](http://localhost:3000).

For Stripe webhooks in local development, run in a second terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret Stripe CLI prints into `STRIPE_WEBHOOK_SECRET`.

### Environment variables

| Variable | Required for | Notes |
|----------|----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase reads/writes | Public project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public pages (`/`, `/search`, `/jobs/[id]`) | Browser/server anon client. |
| `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` | Webhook insert, manage-job, admin | Bypasses RLS; used server-side only. |
| `STRIPE_SECRET_KEY` | `/api/checkout`, webhook signature verification | Test key (`sk_test_…`) for manual QA. |
| `STRIPE_WEBHOOK_SECRET` | `/api/webhooks/stripe` | From Stripe Dashboard or `stripe listen`. |
| `RESEND_API_KEY` | Post-payment email | |
| `TEST_NOTIFICATION_EMAIL` | Post-payment email recipient | Management link is sent here (not necessarily the employer email during testing). |
| `NEXT_PUBLIC_SITE_URL` | Webhook email links | e.g. `http://localhost:3000` — no trailing slash required. |
| `ADMIN_TOKEN` | `/admin` login & session | Plain secret; also used as the admin **password** on login. |

**RLS note:** Project docs may state RLS is disabled on `jobs` during early testing. Security scenarios below describe **intended production behavior** when RLS restricts anonymous access to `status = 'live'` rows only. Re-run those tests after enabling policies in Supabase.

### Automated testing (Playwright)

Run the full suite:

```bash
npm run test:e2e
```

Run job alerts only:

```bash
npm run test:e2e tests/job-alerts.spec.ts
```

Playwright starts its own `npm run dev` by default (with `PLAYWRIGHT_MOCK_RESEND=1`). Stop any other app on port 3000 first, or set `PLAYWRIGHT_REUSE_SERVER=1` only if that server was started with the same env (including mock Resend for alert signups).

**Prerequisites:** Same Supabase service key as other E2E tests (`SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`). The dev server started by Playwright sets `PLAYWRIGHT_MOCK_RESEND=1`, so confirm emails are not sent during E2E.

**Job alert tables:** If setup/teardown logs `permission denied for table job_alert_subscribers`, run [`scripts/supabase-job-alerts-grants.sql`](scripts/supabase-job-alerts-grants.sql) in the Supabase SQL Editor (required after creating the alert tables).

**Job alerts E2E coverage (`tests/job-alerts.spec.ts`):**

| ID | What it checks |
|----|----------------|
| A1 | Home daily signup → pending row in DB |
| A2 | Confirm link → `confirmed_at` set |
| A3 | Search empty-state keyword signup |
| A4 | Keyword confirm success copy |
| A5 | Invalid email inline error |
| A6 | Bad confirm token UI |

Test emails use the pattern `playwright-alert-*@example.com` and are removed in global setup/teardown.

---

## Core user scenarios

### Employer flow (post + pay)

#### E1 — Client-side form validation (no checkout)

**Prerequisites:** `npm run dev`; no Stripe payment required.

**Steps:**

1. Open `/post`.
2. Click submit without filling fields (or clear required fields).
3. Confirm inline errors for: job title, company, employment types (if all deselected), employer email, application link/email.
4. Enter invalid employer email (e.g. `not-an-email`).
5. Enter invalid apply value (e.g. `not a url or email`).
6. Leave job description empty (TipTap editor) and submit with other fields valid.

**Expected results:**

- Required-field messages match copy in `PostJobForm` (e.g. “Job title is required.”).
- Invalid email: “Enter a valid email address.”
- Invalid apply: “Enter a valid URL or email address.”
- Empty description: toast “Job description is required.” — **no** call to `/api/checkout`, no redirect to Stripe.

---

#### E2 — Checkout session creation & Stripe redirect

**Prerequisites:** `STRIPE_SECRET_KEY` set; valid form data.

**Steps:**

1. Fill `/post` with valid data (title, company, at least one employment/setup badge, description, valid apply URL or email, valid employer email).
2. Submit the form.
3. Observe network tab: `POST /api/checkout` with JSON body matching `CheckoutJobPayload` fields.
4. Browser should redirect to Stripe Checkout (`window.location.assign` to returned `url`).

**Expected results:**

- `POST /api/checkout` returns `200` and `{ "url": "https://checkout.stripe.com/..." }`.
- Checkout shows **Red Deer Jobs — 30-day job posting**, **CAD $49.00**, mode **payment**.
- `customer_email` prefilled with employer email.
- Success URL pattern: `{origin}/post-success?session_id={CHECKOUT_SESSION_ID}`.
- Cancel URL: `{origin}/post`.

**Negative — API validation:**

- `POST /api/checkout` with `{}` or malformed JSON → `400` (“Missing or invalid job fields.” / “Invalid JSON body.”).
- Unset `STRIPE_SECRET_KEY` → `500` (“Stripe key missing”).

---

#### E3 — Payment success page

**Prerequisites:** Complete Stripe test payment (card `4242 4242 4242 4242`, any future expiry/CVC).

**Steps:**

1. After payment, land on `/post-success?session_id=cs_test_…`.

**Expected results:**

- Heading **Payment received**; copy states listing is **pending approval**.
- Note about email with management link.
- Links: **Back to job board** (`/`), **Post another job** (`/post`).

**Steps (edge):**

1. Open `/post-success` with no `session_id`.

**Expected results:**

- **Confirming your payment** variant; message about missing checkout session.

---

#### E4 — Stripe webhook → database insert

**Prerequisites:** `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SECRET_KEY`, webhook forwarding active; complete a real test checkout **or** trigger `checkout.session.completed` in Stripe Dashboard with valid session metadata.

**Steps:**

1. Complete employer checkout (E2 + test payment).
2. Confirm Stripe delivers `checkout.session.completed` to `/api/webhooks/stripe`.
3. In Supabase Table Editor (or SQL), find the new `jobs` row.

**Expected results:**

- HTTP `200` with `{ "received": true }` from webhook.
- New row fields populated from checkout metadata: `title`, `company_name`, `pay_range`, `employment_types`, `description`, `apply_method`, `apply_value`, `employer_email`.
- `status` = **`pending`** (employer-paid posts are not auto-live).
- `edit_token` UUID generated.
- Server logs show no insert errors.

**Negative — metadata:**

- Event with missing/invalid metadata → `400` (“Invalid session metadata.”).

---

#### E5 — Resend management email

**Prerequisites:** E4 succeeds; `RESEND_API_KEY`, `TEST_NOTIFICATION_EMAIL`, `NEXT_PUBLIC_SITE_URL` set.

**Steps:**

1. After successful webhook processing, check inbox for `TEST_NOTIFICATION_EMAIL`.

**Expected results:**

- Email from `onboarding@resend.dev`.
- Subject: **Your Job Posting & Management Link**.
- Body contains link: `{NEXT_PUBLIC_SITE_URL}/manage-job/{edit_token}`.

**Negative:**

- If insert succeeds but Resend fails → webhook returns `500` (“Could not send notification email.”); row may exist without email — verify in Supabase and logs.

---

### Employer self-management

Manage routes use the **service role** server client and authenticate via `edit_token` in the URL (not Supabase Auth).

#### M1 — Valid management link

**Prerequisites:** A `jobs` row with known `edit_token` (from E5 email or Supabase).

**Steps:**

1. Open `/manage-job/{edit_token}`.

**Expected results:**

- Form prefilled from DB (title, company, pay, description, apply, read-only employer email).
- Status badge: **Pending Approval** (`pending`), **Live** (`live`), or **Expired** (`expired`).

---

#### M2 — Edit and save (pending or live)

**Prerequisites:** M1; job not `expired`.

**Steps:**

1. Change title and pay fields; update description.
2. Click **Save Changes**.

**Expected results:**

- Success toast; fields persist after refresh.
- Supabase row updated (`title`, `company_name`, `pay_range`, `employment_types`, `description`, `apply_method`, `apply_value`).
- If job was **live**, public `/jobs/{id}` reflects updates after refresh.

**Validation:**

- Clear title → error “Job title and company name are required.”
- Clear all employment badges → “Select at least one employment type or work setup option.”
- Empty description → “Job description is required.”
- Invalid apply → client validation before server call.

---

#### M3 — Expired job cannot be edited

**Prerequisites:** Job with `status = 'expired'` and valid token.

**Steps:**

1. Open manage page.
2. Attempt to edit fields and save.

**Expected results:**

- UI fields disabled when expired; **Save Changes** / **Remove Listing** disabled.
- Server action `updateManagedJob` returns “This listing has expired and can no longer be edited.” if invoked.

---

#### M4 — Remove listing (employer expire)

**Prerequisites:** M1; job not already expired.

**Steps:**

1. Click **Remove Listing**.
2. Confirm in Supabase.

**Expected results:**

- `status` → **`expired`** (row not deleted).
- Job disappears from `/` recent feed and `/search` (live-only queries).
- Live job detail may still render row if anon can read expired rows — see [S1](#s1--pending-and-non-live-jobs-not-on-public-board).

---

#### M5 — Invalid management token

**Steps:**

1. Open `/manage-job/fake-token` or `/manage-job/00000000-0000-0000-0000-000000000000` (non-existent UUID).

**Expected results:**

- **Invalid or Expired Link** card with links to `/post` and `/search`.
- No job data leaked.

---

### Public job board

Public listings use the anon Supabase client and filter **`status = 'live'`** for list/search (see `src/lib/jobs/live-jobs.ts`).

#### P1 — Homepage

**Prerequisites:** At least one `live` job in Supabase.

**Steps:**

1. Open `/`.
2. Verify hero, search UI, and **Recent jobs** section loads.
3. Click a recent job card.

**Expected results:**

- Recent feed shows up to 3 newest live jobs.
- Card navigates to `/jobs/{id}`.

---

#### P2 — Search & filter

**Steps:**

1. From home, enter a keyword and submit → should navigate to `/search?q=…`.
2. Open `/search` with no query → all live jobs, newest first.
3. Use `/search?q={term}` matching a live job title or company.
4. Use a query with no matches.

**Expected results:**

- Results update via `search_jobs` RPC when `q` is non-empty; otherwise full live list.
- Empty state when no live jobs match.
- Job cards link to `/jobs/{id}`.

---

#### P3 — Single job view

**Prerequisites:** Live job with known `id`; note `apply_method` in DB.

**Steps:**

1. Open `/jobs/{id}` for a live listing.
2. For `apply_method = 'url'`: click **Apply Now**.
3. For `apply_method = 'email'`: inspect **Apply Now** link.

**Expected results:**

- Full detail: title, company, badges, HTML description, pay card.
- URL apply: external link (`target="_blank"`, `rel="noopener noreferrer"`), `https://` added if missing.
- Email apply: `mailto:{apply_value}`.

---

#### P4 — Invalid job ID

**Steps:**

1. Open `/jobs/invalid-id` (malformed UUID).
2. Open `/jobs/{valid-uuid-not-in-db}`.

**Expected results:**

- **Job not found** UI with link to `/search`.
- No stack trace or internal errors in the browser.

**Note:** `fetchJobById` does not filter by `status` in application code; visibility of **pending** jobs at this URL depends on Supabase RLS (see S1).

---

### Admin portal

Admin auth uses cookie **`admin_session`**: value is an HMAC derived from `ADMIN_TOKEN` (not the raw token in the cookie). Login password equals `ADMIN_TOKEN`.

#### A1 — Access control (unauthenticated)

**Prerequisites:** Clear cookies for localhost or use private window.

**Steps:**

1. Open `/admin`.

**Expected results:**

- Admin login form only; no listing data.
2. Submit wrong password.

**Expected results:**

- “Invalid Admin Password”.
3. Call server actions without session (e.g. via tampering) — expect `{ error: "Unauthorized" }` from `approveJob`, etc.

---

#### A2 — Login & session

**Prerequisites:** `ADMIN_TOKEN` set in env; restart dev server after changing it.

**Steps:**

1. Enter `ADMIN_TOKEN` as password on `/admin`.
2. Submit.

**Expected results:**

- Redirect to `/admin` dashboard.
- Badge **Admin Session Active**.
- HttpOnly cookie `admin_session` set (7-day max age; `Secure` in production).

---

#### A3 — Pending job moderation

**Prerequisites:** A2; at least one `pending` job (employer flow E4).

**Steps:**

1. On **Pending Approvals & Jobs** tab, locate pending listing.
2. Expand **View details**; verify employer email, pay, description.
3. Click **Approve**.

**Expected results:**

- `status` → **`live`** in Supabase.
- Job appears on `/search` and homepage feed.

**Steps (reject):**

1. Create another pending job.
2. Click **Reject**.

**Expected results:**

- Row **deleted** from `jobs` (same as `deleteJob` / `rejectJob` implementation).

---

#### A4 — Live job admin actions

**Prerequisites:** Live job visible in admin list.

**Steps:**

1. **Unpublish / Archive** → `status` = `expired`; removed from public lists.
2. **Edit** → Edit tab; change fields; save.

**Expected results:**

- Updates persist; public job page updates when still live.

**Steps (expired):**

1. On expired listing, **Republish** → `status` = `live`, `created_at` refreshed.
2. **Delete** → row removed.

---

#### A5 — Admin-created listing

**Prerequisites:** A2.

**Steps:**

1. Open **Create Admin Listing** tab.
2. Submit valid form (same validation as public post form; no employer email field on admin variant — employer email derived from apply field per `mapAdminJobFormToInsert`).

**Expected results:**

- New row inserted with **`status = 'live'`** immediately (no Stripe, no pending).
- Visible on public board without approval step.

---

## Security & data integrity

### S1 — Pending and non-live jobs not on public board

**Prerequisites:** Known `pending` job `id`; anon key available.

**Steps:**

1. As anonymous user, open `/search` and `/`.
2. Confirm pending job title does **not** appear.
3. Optional: call Supabase REST API with **anon** key:
   - `GET .../rest/v1/jobs?status=eq.pending&select=id`
   - `GET .../rest/v1/jobs?id=eq.{pending_id}&select=*`

**Expected results (RLS enabled — production target):**

- Anon client cannot read pending rows; empty or policy error.
- App list pages only query `status = 'live'`.

**Expected results (RLS disabled — dev):**

- Direct REST anon queries may return pending rows; list pages should still hide them. Document any gap if `/jobs/{pending_id}` is reachable without RLS.

---

### S2 — Anonymous users cannot update jobs

**Steps:**

1. With anon key only, attempt `PATCH` or `UPDATE` on `jobs` via Supabase REST or client.

**Expected results (RLS enabled):**

- Update/delete rejected by policy.
- All employer edits go through `/manage-job/[token]` server actions using **service role**, scoped by `edit_token`.

---

### S3 — Invalid dynamic routes

| Route | Test input | Expected UI |
|-------|------------|-------------|
| `/manage-job/fake-token` | Random string | Invalid or Expired Link |
| `/jobs/invalid-id` | Non-UUID or unknown UUID | Job not found |
| `/post-success` | No `session_id` | Confirming your payment copy |

---

### S4 — Stripe webhook signature verification

**Prerequisites:** `STRIPE_WEBHOOK_SECRET` set.

**Steps:**

1. `POST /api/webhooks/stripe` with body `{}` and **no** `stripe-signature` header.

**Expected results:**

- `400` — “Missing signature.”

2. `POST` with header `stripe-signature: t=1,v1=fake` and arbitrary body.

**Expected results:**

- `400` — “Invalid signature.”
- Server log: signature verification failed.

3. Unset `STRIPE_WEBHOOK_SECRET` and POST any payload.

**Expected results:**

- `400` — “Webhook secret is not configured.”

4. Send valid signed event of type **other than** `checkout.session.completed`.

**Expected results:**

- `200` `{ "received": true }` — no DB insert.

---

### S5 — Admin session integrity

**Steps:**

1. Log in to admin; copy `admin_session` cookie value.
2. Modify one character; reload `/admin`.

**Expected results:**

- Treated as logged out; login form shown.
3. Set cookie to raw `ADMIN_TOKEN` (not HMAC).

**Expected results:**

- Invalid session; no dashboard access.

---

### S6 — Checkout API abuse

**Steps:**

1. `POST /api/checkout` with valid shape but extremely long fields (within browser limits).

**Expected results:**

- Stripe metadata chunked via `key__0`, `key__1` for values &gt; 500 chars; webhook still parses via `parseCheckoutJobMetadata`.

---

## Quick reference

### Key routes

| Path | Purpose |
|------|---------|
| `/` | Homepage + recent live jobs |
| `/search?q=` | Search / browse live jobs |
| `/jobs/[id]` | Job detail + apply |
| `/post` | Employer posting form |
| `/post-success` | Post-checkout confirmation |
| `/manage-job/[token]` | Employer edit / remove |
| `/admin` | Moderation & admin create |
| `/api/checkout` | Create Stripe Checkout session |
| `/api/webhooks/stripe` | Stripe `checkout.session.completed` handler |

### Job status lifecycle

```text
Employer (paid)     → pending  → (admin Approve) → live
Admin create        → live
Employer Remove     → expired
Admin Unpublish     → expired
Admin Reject/Delete → row deleted
Admin Republish     → live (+ new created_at)
```

### Suggested smoke test order

1. A2 — Admin login  
2. A5 — Create admin live job → P1/P3 verify public  
3. E1–E5 — Full employer pay flow (Stripe test mode + webhook + email)  
4. A3 — Approve pending → P2 search  
5. M2/M4 — Manage edit and remove  
6. S4 — Webhook signature negatives  

---

*Generated from application source in this repository. Update this guide when env vars, routes, or moderation rules change.*
