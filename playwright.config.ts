import fs from "fs"
import path from "path"

import dotenv from "dotenv"
import { defineConfig, devices } from "@playwright/test"

dotenv.config({ path: path.resolve(__dirname, ".env.local") })
dotenv.config({ path: path.resolve(__dirname, ".env.test") })

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"

const bundledLibs = path.join(
  __dirname,
  ".playwright-libs/usr/lib/x86_64-linux-gnu"
)
/** WSL/minimal Linux: Chromium needs NSPR/NSS from repo-local `.playwright-libs`. */
if (fs.existsSync(bundledLibs)) {
  const segments = (process.env.LD_LIBRARY_PATH ?? "")
    .split(":")
    .filter(Boolean)
  if (!segments.includes(bundledLibs)) {
    process.env.LD_LIBRARY_PATH = [bundledLibs, ...segments].join(":")
  }
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    [path.join(__dirname, "tests/reporters/summary-reporter.ts")],
  ],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "on-first-retry",
  },
  globalSetup: path.join(__dirname, "tests/global-setup.ts"),
  globalTeardown: path.join(__dirname, "tests/global-teardown.ts"),
  webServer: {
    command: "npm run dev",
    url: baseURL,
    // Reuse only when explicitly requested; otherwise start dev with PLAYWRIGHT_MOCK_RESEND.
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "1",
    // reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      PLAYWRIGHT_MOCK_RESEND: "1",
    },
  },
})
