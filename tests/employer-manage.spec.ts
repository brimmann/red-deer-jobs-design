import { expect, test } from "@playwright/test"

import { expectCardTitle } from "./helpers/ui"
import { getAdminSupabase, insertTestJob, TEST_PREFIX } from "./helpers/supabase"

test.describe("Employer self-management", () => {
  test("M1 — valid management link loads prefilled form", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Manage M1`,
      status: "pending",
    })

    await page.goto(`/manage-job/${job.edit_token}`)
    await expect(
      page.getByRole("heading", { name: "Manage Your Job Posting" })
    ).toBeVisible()
    await expect(page.getByText("Pending Approval")).toBeVisible()
    await expect(page.locator("#manage-job-title")).toHaveValue(job.title)
  })

  test("M2 — edit and save updates job in database", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Manage M2`,
      status: "live",
    })
    const updatedTitle = `${TEST_PREFIX} Manage M2 Updated`

    await page.goto(`/manage-job/${job.edit_token}`)
    await page.fill("#manage-job-title", updatedTitle)
    await page.getByRole("button", { name: "Save Changes" }).click()
    await expect(page.getByText("Listing updated.")).toBeVisible()

    const { data } = await getAdminSupabase()
      .from("jobs")
      .select("title, description")
      .eq("id", job.id)
      .single()

    expect(data?.title).toBe(updatedTitle)
  })

  test("M3 — expired job cannot be edited", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Manage M3`,
      status: "expired",
    })

    await page.goto(`/manage-job/${job.edit_token}`)
    await expect(page.getByText("Expired")).toBeVisible()
    await expect(page.locator("#manage-job-title")).toBeDisabled()
    await expect(page.getByRole("button", { name: "Save Changes" })).toBeDisabled()
    await expect(page.getByRole("button", { name: "Remove Listing" })).toBeDisabled()
  })

  test("M4 — remove listing marks job expired", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Manage M4`,
      status: "live",
    })

    page.once("dialog", (dialog) => dialog.accept())
    await page.goto(`/manage-job/${job.edit_token}`)
    await page.getByRole("button", { name: "Remove Listing" }).click()
    await expect(page.getByRole("status")).toHaveText("Listing removed.")

    const { data } = await getAdminSupabase()
      .from("jobs")
      .select("status")
      .eq("id", job.id)
      .single()

    expect(data?.status).toBe("expired")
  })

  test("M5 — invalid management token shows error UI", async ({ page }) => {
    await page.goto("/manage-job/fake-token")
    await expectCardTitle(page, "Invalid or Expired Link")
  })
})
