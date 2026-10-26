import Stripe from "stripe"

import { requireEnv } from "./env"
import { TEST_PREFIX } from "./supabase"

const METADATA_VALUE_MAX = 500

export function chunkMetadataValue(
  metadata: Record<string, string>,
  key: string,
  value: string
) {
  if (value.length <= METADATA_VALUE_MAX) {
    metadata[key] = value
    return
  }
  let index = 0
  for (let offset = 0; offset < value.length; offset += METADATA_VALUE_MAX) {
    metadata[`${key}__${index}`] = value.slice(
      offset,
      offset + METADATA_VALUE_MAX
    )
    index += 1
  }
}

export function buildJobMetadata(
  suffix: string,
  overrides: Partial<Record<string, string>> = {}
): Record<string, string> {
  const metadata: Record<string, string> = {}
  chunkMetadataValue(
    metadata,
    "title",
    overrides.title ?? `${TEST_PREFIX} Webhook ${suffix}`
  )
  chunkMetadataValue(
    metadata,
    "company",
    overrides.company ?? `${TEST_PREFIX} Webhook Co`
  )
  chunkMetadataValue(metadata, "addressLine", overrides.addressLine ?? "")
  chunkMetadataValue(
    metadata,
    "employmentSetup",
    overrides.employmentSetup ?? JSON.stringify(["Full-Time"])
  )
  chunkMetadataValue(metadata, "payAmountMin", overrides.payAmountMin ?? "20")
  chunkMetadataValue(metadata, "payAmountMax", overrides.payAmountMax ?? "30")
  chunkMetadataValue(metadata, "payPreset", overrides.payPreset ?? "Hourly")
  chunkMetadataValue(
    metadata,
    "description",
    overrides.description ?? "<p>Webhook test description.</p>"
  )
  chunkMetadataValue(
    metadata,
    "applyTo",
    overrides.applyTo ?? "https://example.com/apply"
  )
  chunkMetadataValue(
    metadata,
    "employerEmail",
    overrides.employerEmail ?? "webhook-test@example.com"
  )
  return metadata
}

export function buildCheckoutCompletedEvent(
  metadata: Record<string, string>,
  sessionId = `cs_test_${Date.now()}`
): Stripe.Event {
  return {
    id: `evt_${sessionId}`,
    object: "event",
    api_version: "2024-06-20",
    created: Math.floor(Date.now() / 1000),
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        metadata,
      },
    },
  } as Stripe.Event
}

export function signStripeEvent(event: Stripe.Event): {
  body: string
  signature: string
} {
  const secret = requireEnv("STRIPE_WEBHOOK_SECRET")
  const body = JSON.stringify(event)
  const stripe = new Stripe("sk_test_playwright_local_only")
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret,
  })
  return { body, signature }
}
