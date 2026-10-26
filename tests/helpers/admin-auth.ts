import type { Browser } from "@playwright/test"
import fs from "fs"
import path from "path"

import { getAdminToken } from "./env"

export const ADMIN_AUTH_FILE = path.join(__dirname, "../.auth/admin.json")

export async function ensureAdminStorageState(browser: Browser) {
  fs.mkdirSync(path.dirname(ADMIN_AUTH_FILE), { recursive: true })
  const context = await browser.newContext()
  await context.clearCookies()
  const page = await context.newPage()
  await page.goto("/admin", { waitUntil: "domcontentloaded" })

  const loginVisible = await page
    .locator("#admin-password")
    .isVisible()
    .catch(() => false)

  if (loginVisible) {
    await page.fill("#admin-password", getAdminToken())
    await page.getByRole("button", { name: "Sign in" }).click()
  }

  await page
    .getByRole("heading", { name: "Admin Management" })
    .waitFor({ timeout: 30_000 })
  await context.storageState({ path: ADMIN_AUTH_FILE })
  await context.close()
}
