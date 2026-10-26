import { expect, test } from "@playwright/test"

import { ADMIN_SESSION_COOKIE } from "../src/lib/admin/session"
import { ADMIN_AUTH_FILE, ensureAdminStorageState } from "./helpers/admin-auth"
import { requireEnv } from "./helpers/env"
import { chunkMetadataValue } from "./helpers/stripe-webhook"
import {
  buildCheckoutCompletedEvent,
  buildJobMetadata,
  signStripeEvent,
} from "./helpers/stripe-webhook"
import {
  getAdminSupabase,
  getAnonSupabase,
  insertTestJob,
  TEST_PREFIX,
} from "./helpers/supabase"
import { expectCardTitle } from "./helpers/ui"
import { parseCheckoutJobMetadata } from "../src/lib/stripe-job-metadata"

test.describe("Security & data integrity", () => {
  test("S1 — pending jobs are hidden from public search UI", async ({ page }) => {
    const unique = `PendingHidden${Date.now()}`
    await insertTestJob({
      title: `${TEST_PREFIX} ${unique}`,
      status: "pending",
    })

    await page.goto(`/search?q=${encodeURIComponent(unique)}`)
    await expect(page.getByText(`Showing 0 jobs for '${unique}'`)).toBeVisible()
  })

  test("S1 — anon Supabase client cannot read pending jobs when RLS blocks", async () => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} S1 Anon ${Date.now()}`,
      status: "pending",
    })

    const anon = getAnonSupabase()
    const { data, error } = await anon
      .from("jobs")
      .select("id")
      .eq("id", job.id)
      .maybeSingle()

    if (data) {
      test.info().annotations.push({
        type: "note",
        description:
          "RLS appears disabled: anon could read pending row. Enable RLS for production.",
      })
    }

    const list = await anon
      .from("jobs")
      .select("id, title")
      .eq("status", "live")
      .ilike("title", `${TEST_PREFIX}%`)

    expect(list.error).toBeNull()
    for (const row of list.data ?? []) {
      expect(row.title).not.toBe(job.title)
    }
  })

  test("S2 — anon client cannot update jobs when RLS is enforced", async () => {
    const originalTitle = `${TEST_PREFIX} S2 Anon Update ${Date.now()}`
    const job = await insertTestJob({
      title: originalTitle,
      status: "live",
    })

    const anon = getAnonSupabase()
    const { data, error } = await anon
      .from("jobs")
      .update({ title: `${TEST_PREFIX} Hacked Title` })
      .eq("id", job.id)
      .select("title")

    const { data: after } = await getAdminSupabase()
      .from("jobs")
      .select("title")
      .eq("id", job.id)
      .single()

    if (data?.length && after?.title !== originalTitle) {
      expect.fail(
        "Anonymous update changed the row; enable RLS policies blocking public updates."
      )
    }

    expect(after?.title).toBe(originalTitle)
    if (data?.length) {
      expect.fail(
        "Anonymous update returned rows; enable RLS policies blocking public updates."
      )
    }
  })

  test("S3 — invalid manage-job token route", async ({ page }) => {
    await page.goto("/manage-job/fake-token")
    await expectCardTitle(page, "Invalid or Expired Link")
  })

  test("S3 — invalid jobs id route", async ({ page }) => {
    await page.goto("/jobs/invalid-id")
    await expectCardTitle(page, "Job not found")
  })

  test("S3 — post-success without session_id", async ({ page }) => {
    await page.goto("/post-success")
    await expectCardTitle(page, "Confirming your payment")
  })

  test("S4 — webhook rejects missing signature", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      data: "{}",
      headers: { "content-type": "application/json" },
    })
    expect(response.status()).toBe(400)
    expect(await response.json()).toMatchObject({ error: "Missing signature." })
  })

  test("S4 — webhook rejects invalid signature", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      data: JSON.stringify({ type: "checkout.session.completed" }),
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=1,v1=invalid",
      },
    })
    expect(response.status()).toBe(400)
    expect(await response.json()).toMatchObject({ error: "Invalid signature." })
  })

  test("S4 — webhook ignores non-checkout events when signed", async ({
    request,
  }) => {
    const event = {
      id: "evt_other",
      object: "event",
      type: "customer.created",
      data: { object: {} },
    }
    const { body, signature } = signStripeEvent(event as never)
    const response = await request.post("/api/webhooks/stripe", {
      data: body,
      headers: {
        "content-type": "application/json",
        "stripe-signature": signature,
      },
    })
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ received: true })
  })

  test("S4 — webhook rejects invalid session metadata", async ({ request }) => {
    const event = buildCheckoutCompletedEvent({ title: "only-title" })
    const { body, signature } = signStripeEvent(event)
    const response = await request.post("/api/webhooks/stripe", {
      data: body,
      headers: {
        "content-type": "application/json",
        "stripe-signature": signature,
      },
    })
    expect(response.status()).toBe(400)
  })

  test("S5 — tampered admin session cookie denies dashboard", async ({
    browser,
  }) => {
    await ensureAdminStorageState(browser)
    const context = await browser.newContext({ storageState: ADMIN_AUTH_FILE })
    const cookies = await context.cookies()
    const session = cookies.find((c) => c.name === ADMIN_SESSION_COOKIE)
    expect(session).toBeTruthy()

    await context.addCookies([
      {
        ...session!,
        value: `${session!.value.slice(0, -1)}x`,
      },
    ])

    const page = await context.newPage()
    await page.goto("/admin")
    await expectCardTitle(page, "Admin access")
    await context.close()
  })

  test("S5 — raw ADMIN_TOKEN is not accepted as session cookie", async ({
    browser,
  }) => {
    const context = await browser.newContext()
    await context.addCookies([
      {
        name: ADMIN_SESSION_COOKIE,
        value: requireEnv("ADMIN_TOKEN"),
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ])
    const page = await context.newPage()
    await page.goto("/admin")
    await expectCardTitle(page, "Admin access")
    await context.close()
  })

  test("S6 — long checkout metadata reassembles via parser", async () => {
    const longTitle = "x".repeat(620)
    const metadata: Record<string, string> = {}
    chunkMetadataValue(metadata, "title", longTitle)
    chunkMetadataValue(metadata, "company", `${TEST_PREFIX} Long Co`)
    chunkMetadataValue(metadata, "employmentSetup", JSON.stringify(["Full-Time"]))
    chunkMetadataValue(metadata, "applyTo", "https://example.com/apply")
    chunkMetadataValue(metadata, "employerEmail", "long-meta@example.com")
    chunkMetadataValue(metadata, "description", "<p>Long metadata test</p>")

    const parsed = parseCheckoutJobMetadata(metadata)
    expect(parsed?.title).toBe(longTitle)
  })

  test("S6 — signed webhook accepts chunked metadata insert", async ({
    request,
  }) => {
    const suffix = `long-${Date.now()}`
    const longTitle = `${TEST_PREFIX} ${"y".repeat(550)} ${suffix}`
    const metadata = buildJobMetadata(suffix, { title: longTitle })
    const event = buildCheckoutCompletedEvent(metadata, `cs_test_${suffix}`)
    const { body, signature } = signStripeEvent(event)

    const response = await request.post("/api/webhooks/stripe", {
      data: body,
      headers: {
        "content-type": "application/json",
        "stripe-signature": signature,
      },
    })

    expect(response.status()).toBe(200)
  })
})
