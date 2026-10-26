import { expect, test } from "@playwright/test"

import { ADMIN_AUTH_FILE, ensureAdminStorageState } from "./helpers/admin-auth"
import { fillValidAdminPostForm } from "./helpers/post-form"
import {
  getAdminSupabase,
  insertTestJob,
  TEST_PREFIX,
} from "./helpers/supabase"
import { expectCardTitle } from "./helpers/ui"

test.describe("Admin portal — unauthenticated", () => {
  test("A1 — unauthenticated users see login only", async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto("/admin")
    await expectCardTitle(page, "Admin access")
    await expect(page.getByText("Admin Session Active")).toHaveCount(0)
    await context.close()
  })

  test("A1 — wrong admin password shows error", async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto("/admin")
    await page.fill("#admin-password", "definitely-wrong-password")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByText("Invalid Admin Password")).toBeVisible()
    await context.close()
  })
})

test.describe("Admin portal — authenticated", () => {
  test.describe.configure({ timeout: 120_000 })

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120_000)
    await ensureAdminStorageState(browser)
  })

  test.use({ storageState: ADMIN_AUTH_FILE })

  test("A2 — valid login shows admin dashboard", async ({ page }) => {
    await page.goto("/admin")
    await expect(page.getByText("Admin Session Active")).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Admin Management" })
    ).toBeVisible()
  })

  test("A3 — approve pending job sets status live", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Admin Approve ${Date.now()}`,
      status: "pending",
    })

    await page.goto("/admin")
    const card = page.locator('[data-slot="card"]').filter({ hasText: job.title })
    await card.getByRole("button", { name: "Approve" }).click()

    await expect.poll(async () => {
      const { data } = await getAdminSupabase()
        .from("jobs")
        .select("status")
        .eq("id", job.id)
        .single()
      return data?.status
    }).toBe("live")
  })

  test("A3 — reject pending job deletes row", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Admin Reject ${Date.now()}`,
      status: "pending",
    })

    await page.goto("/admin")
    const card = page.locator('[data-slot="card"]').filter({ hasText: job.title })
    await card.getByRole("button", { name: "Reject" }).click()

    await expect.poll(async () => {
      const { data } = await getAdminSupabase()
        .from("jobs")
        .select("id")
        .eq("id", job.id)
        .maybeSingle()
      return data
    }).toBeNull()
  })

  test("A4 — edit live job from admin dashboard", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Admin Edit ${Date.now()}`,
      status: "live",
    })
    const updatedTitle = `${job.title} Edited`

    await page.goto("/admin")
    const card = page.locator('[data-slot="card"]').filter({ hasText: job.title })
    await card.getByRole("button", { name: "Edit" }).click()
    await page.getByRole("tab", { name: "Edit" }).waitFor()
    await page.locator("#admin-edit-job-title").fill(updatedTitle)
    await page.getByRole("button", { name: "Save", exact: true }).click()

    await expect.poll(async () => {
      const { data } = await getAdminSupabase()
        .from("jobs")
        .select("title")
        .eq("id", job.id)
        .single()
      return data?.title
    }).toBe(updatedTitle)
  })

  test("A4 — unpublish live job sets expired", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Admin Unpublish ${Date.now()}`,
      status: "live",
    })

    await page.goto("/admin")
    const card = page.locator('[data-slot="card"]').filter({ hasText: job.title })
    await card.getByRole("button", { name: "Unpublish / Archive" }).click()

    await expect.poll(async () => {
      const { data } = await getAdminSupabase()
        .from("jobs")
        .select("status")
        .eq("id", job.id)
        .single()
      return data?.status
    }).toBe("expired")
  })

  test("A4 — republish expired job sets live", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Admin Republish ${Date.now()}`,
      status: "expired",
    })

    await page.goto("/admin")
    const card = page.locator('[data-slot="card"]').filter({ hasText: job.title })
    await card.getByRole("button", { name: "Republish" }).click()

    await expect.poll(async () => {
      const { data } = await getAdminSupabase()
        .from("jobs")
        .select("status")
        .eq("id", job.id)
        .single()
      return data?.status
    }).toBe("live")
  })

  test("A4 — delete expired job removes row", async ({ page }) => {
    const job = await insertTestJob({
      title: `${TEST_PREFIX} Admin Delete ${Date.now()}`,
      status: "expired",
    })

    await page.goto("/admin")
    const card = page.locator('[data-slot="card"]').filter({ hasText: job.title })
    await card.getByRole("button", { name: "Delete" }).click()

    await expect.poll(async () => {
      const { data } = await getAdminSupabase()
        .from("jobs")
        .select("id")
        .eq("id", job.id)
        .maybeSingle()
      return data
    }).toBeNull()
  })

  test("A5 — admin create listing publishes live immediately", async ({
    page,
  }) => {
    const title = `${TEST_PREFIX} Admin Create ${Date.now()}`
    await page.goto("/admin")
    await page.getByRole("tab", { name: "Create Admin Listing" }).click()
    await fillValidAdminPostForm(page, { title })
    await page.getByRole("button", { name: "Publish Listing Immediately" }).click()
    await expect(page.getByRole("status")).toHaveText(
      "Listing published successfully."
    )

    await expect.poll(async () => {
      const { data } = await getAdminSupabase()
        .from("jobs")
        .select("status")
        .eq("title", title)
        .maybeSingle()
      return data?.status
    }).toBe("live")
  })
})
