import { expect, test } from "@playwright/test"

import { insertTestJob, TEST_PREFIX } from "./helpers/supabase"
import { expectCardTitle } from "./helpers/ui"

test.describe("Public job board", () => {
  test("P1 — homepage renders and links to job detail", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Homepage P1`,
      status: "live",
    })

    await page.goto("/")
    await expect(page.getByRole("link", { name: "Red Deer Jobs" })).toBeVisible()
    await page.getByRole("link", { name: job.title }).click()
    await expect(page).toHaveURL(`/jobs/${job.id}`)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(job.title)
  })

  test("P2 — search filters live jobs by query", async ({ page }) => {
    const unique = `SearchToken${Date.now()}`
    const job = await insertTestJob({
      title: `${TEST_PREFIX} ${unique} Role`,
      status: "live",
    })

    await page.goto(`/search?q=${encodeURIComponent(unique)}`)
    await expect(page.getByText(`Showing 1 job for '${unique}'`)).toBeVisible()
    await expect(page.getByRole("link", { name: job.title })).toBeVisible()
  })

  test("P2 — search without query lists live jobs", async ({ page }) => {
    await insertTestJob({
      title: `${TEST_PREFIX} Browse All ${Date.now()}`,
      status: "live",
    })

    await page.goto("/search")
    await expect(page.getByText(/Showing \d+ job/)).toBeVisible()
  })

  test("P3 — job detail Apply Now opens URL apply link", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Apply URL P3`,
      status: "live",
      apply_method: "url",
      apply_value: "example.com/apply-here",
    })

    await page.goto(`/jobs/${job.id}`)
    const applyLink = page.getByRole("link", { name: "Apply Now" })
    await expect(applyLink).toHaveAttribute("href", "https://example.com/apply-here")
    await expect(applyLink).toHaveAttribute("target", "_blank")
  })

  test("P3 — job detail Apply Now uses mailto for email apply", async ({
    page,
  }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Apply Email P3`,
      status: "live",
      apply_method: "email",
      apply_value: "hiring@example.com",
    })

    await page.goto(`/jobs/${job.id}`)
    await expect(page.getByRole("link", { name: "Apply Now" })).toHaveAttribute(
      "href",
      "mailto:hiring@example.com"
    )
  })

  test("P4 — invalid job id shows not found", async ({ page }) => {
    await page.goto("/jobs/not-a-valid-uuid")
    await expectCardTitle(page, "Job not found")
  })

  test("P4 — unknown job uuid shows not found", async ({ page }) => {
    await page.goto("/jobs/00000000-0000-0000-0000-000000000000")
    await expectCardTitle(page, "Job not found")
  })
})
