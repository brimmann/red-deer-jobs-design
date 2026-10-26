import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

/** shadcn CardTitle renders a div, not a heading role */
export async function expectCardTitle(page: Page, title: string) {
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible()
}
