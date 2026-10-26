import { expect, test } from "@playwright/test"

import { findTestJobByTitle, TEST_PREFIX } from "./helpers/supabase"
import {
  buildCheckoutCompletedEvent,
  buildJobMetadata,
  signStripeEvent,
} from "./helpers/stripe-webhook"
import {
  deselectAllEmploymentBadges,
  fillValidPublicPostForm,
} from "./helpers/post-form"
import { expectCardTitle } from "./helpers/ui"

test.describe("Employer flow (post + pay)", () => {
  test("E1 — client-side form validation blocks checkout", async ({ page }) => {
    let checkoutCalled = false
    await page.route("**/api/checkout", async (route) => {
      checkoutCalled = true
      await route.fulfill({ status: 500, body: "should not be called" })
    })

    await page.goto("/post")
    await page.getByRole("button", { name: "Pay $49 & Publish Job" }).click()

    await expect(page.locator("#job-title-error")).toHaveText(
      "Job title is required."
    )
    await expect(page.locator("#company-name-error")).toHaveText(
      "Company name is required."
    )
    await expect(page.locator("#employer-email-error")).toHaveText(
      "Your email is required."
    )
    await expect(page.locator("#apply-to-error")).toHaveText(
      "Enter an application link or email."
    )

    await page.fill("#job-title", "Test Role")
    await page.fill("#company-name", "Test Co")
    await deselectAllEmploymentBadges(page)
    await page.getByRole("button", { name: "Pay $49 & Publish Job" }).click()
    await expect(page.locator("#employment-type-error")).toHaveText(
      "Select at least one employment type or work setup option."
    )

    await page.getByRole("button", { name: "Full-Time", exact: true }).click()
    await page.fill("#employer-email", "not-an-email")
    await page.getByRole("button", { name: "Pay $49 & Publish Job" }).click()
    await expect(page.locator("#employer-email-error")).toHaveText(
      "Enter a valid email address."
    )

    await page.fill("#employer-email", "valid@example.com")
    await page.fill("#apply-to", "@@@not-valid@@@")
    await page.getByRole("button", { name: "Pay $49 & Publish Job" }).click()
    await expect(
      page.getByText("Enter a valid URL or email address.")
    ).toBeVisible()

    await page.fill("#apply-to", "https://example.com/jobs")
    await page.getByRole("button", { name: "Pay $49 & Publish Job" }).click()
    await expect(page.getByRole("status")).toHaveText(
      "Job description is required."
    )
    expect(checkoutCalled).toBe(false)
  })

  test("E2 — checkout session created and redirects to Stripe (mocked)", async ({
    page,
  }) => {
    test.setTimeout(120_000)
    let checkoutPayload: unknown = null
    await page.route("**/api/checkout", async (route) => {
      checkoutPayload = route.request().postDataJSON()
      const origin = new URL(route.request().url()).origin
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: `${origin}/post-success?session_id=cs_test_mock_checkout`,
        }),
      })
    })

    await page.goto("/post", { waitUntil: "domcontentloaded" })
    await page.locator("#job-title").waitFor({ state: "visible" })
    await fillValidPublicPostForm(page, {
      title: "[TEST] Checkout Flow",
      employerEmail: "checkout@example.com",
    })
    await page.getByRole("button", { name: "Pay $49 & Publish Job" }).click()

    await expectCardTitle(page, "Payment received")
    expect(checkoutPayload).toMatchObject({
      title: "[TEST] Checkout Flow",
      employerEmail: "checkout@example.com",
    })
  })

  test("E2 — checkout API rejects invalid JSON and invalid payload", async ({
    request,
  }) => {
    const invalidJson = await request.post("/api/checkout", {
      data: "not-json",
      headers: { "Content-Type": "application/json" },
    })
    expect(invalidJson.status()).toBe(400)

    const invalidBody = await request.post("/api/checkout", {
      data: {},
    })
    expect(invalidBody.status()).toBe(400)
    expect(await invalidBody.json()).toMatchObject({
      error: "Missing or invalid job fields.",
    })
  })

  test("E3 — post-success with session_id shows payment received", async ({
    page,
  }) => {
    await page.goto("/post-success?session_id=cs_test_playwright")
    await expectCardTitle(page, "Payment received")
    await expect(page.getByText("pending approval")).toBeVisible()
  })

  test("E3 — post-success without session_id shows confirming copy", async ({
    page,
  }) => {
    await page.goto("/post-success")
    await expectCardTitle(page, "Confirming your payment")
  })

  test("E4 — Stripe webhook inserts pending job (Resend mocked)", async ({
    request,
  }) => {
    const suffix = `${Date.now()}`
    const metadata = buildJobMetadata(suffix)
    const event = buildCheckoutCompletedEvent(metadata)
    const { body, signature } = signStripeEvent(event)

    const response = await request.post("/api/webhooks/stripe", {
      headers: {
        "stripe-signature": signature,
        "content-type": "application/json",
      },
      data: body,
    })

    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ received: true })

    const job = await findTestJobByTitle(`${TEST_PREFIX} Webhook ${suffix}`)
    expect(job).not.toBeNull()
    expect(job?.status).toBe("pending")
  })

  test("E5 — webhook completes when Resend is mocked (no outbound email)", async ({
    request,
  }) => {
    const suffix = `email-${Date.now()}`
    const metadata = buildJobMetadata(suffix, {
      employerEmail: "e5-resend-mock@example.com",
    })
    const event = buildCheckoutCompletedEvent(metadata, `cs_test_${suffix}`)
    const { body, signature } = signStripeEvent(event)

    const response = await request.post("/api/webhooks/stripe", {
      headers: {
        "stripe-signature": signature,
        "content-type": "application/json",
      },
      data: body,
    })

    expect(response.status()).toBe(200)
    const job = await findTestJobByTitle(`${TEST_PREFIX} Webhook ${suffix}`)
    expect(job?.edit_token).toBeTruthy()
  })
})
