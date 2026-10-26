"use server"

import { headers } from "next/headers"

import {
  requestJobAlertSignup,
  type JobAlertSignupResult,
} from "@/lib/job-alerts"

function resolveClientIp(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown"
}

export async function submitJobAlertSignup(input: {
  email: string
  searchQuery?: string | null
}): Promise<JobAlertSignupResult> {
  const headerStore = await headers()
  return requestJobAlertSignup({
    email: input.email,
    searchQuery: input.searchQuery ?? null,
    clientIp: resolveClientIp(headerStore),
  })
}
