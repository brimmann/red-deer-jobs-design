import { expect, test } from "@playwright/test"

import {
  createTestAlertEmail,
  getAlertSubscriber,
} from "./helpers/supabase"
import { expectCardTitle } from "./helpers/ui"

test.describe("Job alerts", () => {
  test("A1 — daily signup creates pending subscriber", async ({ page }) => {
    const email = createTestAlertEmail("daily-a1")

    await page.goto("/")
    await page.locator("#alert-email").fill(email)
    await page.getByRole("button", { name: "Get alerts" }).click()

    await expect(
      page.getByText("Check your email to confirm daily alerts.")
    ).toBeVisible()

    const row = await getAlertSubscriber(email, null)
    expect(row).not.toBeNull()
    expect(row!.confirmed_at).toBeNull()
    expect(row!.confirm_token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
    expect(row!.confirm_expires_at).not.toBeNull()
  })

  test("A2 — confirm daily alert activates subscriber", async ({ page }) => {
    const email = createTestAlertEmail("daily-a2")

    await page.goto("/")
    await page.locator("#alert-email").fill(email)
    await page.getByRole("button", { name: "Get alerts" }).click()
    await expect(
      page.getByText("Check your email to confirm daily alerts.")
    ).toBeVisible()

    const pending = await getAlertSubscriber(email, null)
    expect(pending?.confirm_token).toBeTruthy()

    await page.goto(`/alerts/confirm/${pending!.confirm_token}`)
    await expectCardTitle(page, "Alerts confirmed")
    await expect(
      page.getByText("You are on the daily Red Deer list.")
    ).toBeVisible()

    const confirmed = await getAlertSubscriber(email, null)
    expect(confirmed?.confirmed_at).not.toBeNull()
    expect(confirmed?.confirm_token).toBeNull()
    expect(confirmed?.confirm_expires_at).toBeNull()
  })

  test("A3 — keyword signup from search empty state", async ({ page }) => {
    const email = createTestAlertEmail("keyword-a3")
    const rawQuery = `AlertE2E${Date.now()}NoMatch`
    const normalizedQuery = rawQuery.toLowerCase()

    await page.goto(`/search?q=${encodeURIComponent(rawQuery)}`)
    await expect(page.getByRole("button", { name: "Get Alerted" })).toBeVisible()

    const emailInput = page.getByPlaceholder("you@email.com")
    await emailInput.fill(email)
    await page.getByRole("button", { name: "Get Alerted" }).click()

    await expect(
      page.getByText("Check your email to confirm this alert.")
    ).toBeVisible()

    const row = await getAlertSubscriber(email, normalizedQuery)
    expect(row).not.toBeNull()
    expect(row!.search_query).toBe(normalizedQuery)
    expect(row!.confirmed_at).toBeNull()
    expect(row!.confirm_token).toBeTruthy()
  })

  test("A4 — confirm keyword alert shows query in success copy", async ({
    page,
  }) => {
    const email = createTestAlertEmail("keyword-a4")
    const rawQuery = `AlertE2E${Date.now()}Confirm`
    const normalizedQuery = rawQuery.toLowerCase()

    await page.goto(`/search?q=${encodeURIComponent(rawQuery)}`)
    await expect(page.getByRole("button", { name: "Get Alerted" })).toBeVisible()

    const emailInput = page.getByPlaceholder("you@email.com")
    await emailInput.fill(email)
    await page.getByRole("button", { name: "Get Alerted" }).click()
    await expect(
      page.getByText("Check your email to confirm this alert.")
    ).toBeVisible()

    const pending = await getAlertSubscriber(email, normalizedQuery)
    expect(pending?.confirm_token).toBeTruthy()

    await page.goto(`/alerts/confirm/${pending!.confirm_token}`)
    await expectCardTitle(page, "Alerts confirmed")
    await expect(
      page.getByText(
        `You will get an email when a new “${normalizedQuery}” job is posted in Red Deer.`
      )
    ).toBeVisible()
  })

  test("A5 — invalid email shows inline error on home", async ({ page }) => {
    await page.goto("/")
    await page.locator("#alert-email").fill("not-an-email")
    await page.getByRole("button", { name: "Get alerts" }).click()

    await expect(
      page.getByText("Enter a valid email address.")
    ).toBeVisible()
  })

  test("A6 — invalid confirm token shows invalid link card", async ({
    page,
  }) => {
    await page.goto(
      "/alerts/confirm/00000000-0000-0000-0000-000000000000"
    )
    await expectCardTitle(page, "Invalid or expired link")
  })
})
