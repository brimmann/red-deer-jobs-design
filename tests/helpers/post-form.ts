import type { Page } from "@playwright/test"

import { TEST_PREFIX } from "./supabase"

export async function fillJobDescription(page: Page, text: string) {
  const editor = page.getByRole("textbox", { name: "Job description" })
  await editor.waitFor({ state: "visible", timeout: 30_000 })
  await editor.click()
  await editor.fill(text)
}

export async function fillManageJobDescription(page: Page, text: string) {
  const editor = page.getByRole("textbox", { name: "Job description" })
  await editor.waitFor({ state: "visible", timeout: 30_000 })
  await editor.click()
  await editor.fill(text)
}

export async function fillValidPublicPostForm(
  page: Page,
  options?: {
    title?: string
    company?: string
    applyTo?: string
    employerEmail?: string
  }
) {
  await page.fill("#job-title", options?.title ?? "QA Engineer")
  await page.fill("#company-name", options?.company ?? "Playwright Test Co")
  await page.fill("#apply-to", options?.applyTo ?? "https://example.com/careers")
  await page.fill(
    "#employer-email",
    options?.employerEmail ?? "employer@example.com"
  )
  await fillJobDescription(page, "Automated test job description content.")
}

export async function fillValidAdminPostForm(
  page: Page,
  options?: { title?: string; applyTo?: string }
) {
  await page.fill(
    "#job-title",
    options?.title ?? `${TEST_PREFIX} Admin Job ${Date.now()}`
  )
  await page.fill("#company-name", "Admin Test Co")
  await page.fill("#apply-to", options?.applyTo ?? "https://example.com/apply")
  await fillJobDescription(page, "Admin-created listing description.")
}

export async function deselectAllEmploymentBadges(page: Page) {
  const groups = page.locator(
    '[aria-label="Employment types"], [aria-label="Work setup"]'
  )
  const selected = groups.locator('[aria-pressed="true"]')
  while ((await selected.count()) > 0) {
    await selected.first().click()
  }
}
