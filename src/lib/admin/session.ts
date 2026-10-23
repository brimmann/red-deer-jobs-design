import { createHmac, timingSafeEqual } from "crypto"

export const ADMIN_SESSION_COOKIE = "admin_session"

function getAdminToken(): string | undefined {
  return process.env.ADMIN_TOKEN?.trim() || undefined
}

export function createAdminSessionValue(): string {
  const token = getAdminToken()
  if (!token) {
    throw new Error("ADMIN_TOKEN is not configured.")
  }
  return createHmac("sha256", token).update("red-deer-admin-v1").digest("hex")
}

export function isValidAdminSession(cookieValue: string | undefined): boolean {
  if (!cookieValue || !getAdminToken()) return false
  try {
    const expected = createAdminSessionValue()
    const actual = Buffer.from(cookieValue, "utf8")
    const reference = Buffer.from(expected, "utf8")
    if (actual.length !== reference.length) return false
    return timingSafeEqual(actual, reference)
  } catch {
    return false
  }
}

export function verifyAdminPassword(password: string): boolean {
  const token = getAdminToken()
  if (!token) return false
  const entered = Buffer.from(password, "utf8")
  const expected = Buffer.from(token, "utf8")
  if (entered.length !== expected.length) return false
  return timingSafeEqual(entered, expected)
}
