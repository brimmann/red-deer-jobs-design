import Stripe from "stripe"
import { NextResponse } from "next/server"

import type { CheckoutJobPayload } from "@/lib/checkout-job-payload"

const METADATA_VALUE_MAX = 500

function setMetadataValue(
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

function buildJobMetadata(payload: CheckoutJobPayload): Record<string, string> {
  const metadata: Record<string, string> = {}
  setMetadataValue(metadata, "title", payload.title.trim())
  setMetadataValue(metadata, "company", payload.company.trim())
  setMetadataValue(metadata, "addressLine", payload.addressLine.trim())
  setMetadataValue(
    metadata,
    "employmentSetup",
    JSON.stringify(payload.employmentSetup)
  )
  setMetadataValue(metadata, "payAmountMin", payload.payAmountMin.trim())
  setMetadataValue(metadata, "payAmountMax", payload.payAmountMax.trim())
  setMetadataValue(metadata, "payPreset", payload.payPreset?.trim() ?? "")
  setMetadataValue(metadata, "description", payload.description)
  setMetadataValue(metadata, "applyTo", payload.applyTo.trim())
  setMetadataValue(metadata, "employerEmail", payload.employerEmail.trim())
  return metadata
}

function isValidPayload(body: unknown): body is CheckoutJobPayload {
  if (!body || typeof body !== "object") return false
  const record = body as Record<string, unknown>
  return (
    typeof record.title === "string" &&
    typeof record.company === "string" &&
    typeof record.addressLine === "string" &&
    Array.isArray(record.employmentSetup) &&
    record.employmentSetup.every((item) => typeof item === "string") &&
    typeof record.payAmountMin === "string" &&
    typeof record.payAmountMax === "string" &&
    (record.payPreset === null || typeof record.payPreset === "string") &&
    typeof record.description === "string" &&
    typeof record.applyTo === "string" &&
    typeof record.employerEmail === "string"
  )
}

function stripeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function POST(request: Request) {
  console.log("Checkout route hit")

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    console.error("Missing STRIPE_SECRET_KEY")
    return NextResponse.json({ error: "Stripe key missing" }, { status: 500 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!isValidPayload(payload)) {
    return NextResponse.json(
      { error: "Missing or invalid job fields." },
      { status: 400 }
    )
  }

  const origin =
    request.headers.get("origin") ?? new URL(request.url).origin

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: payload.employerEmail.trim(),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: 4900,
            product_data: {
              name: "Red Deer Jobs — 30-day job posting",
              description: "One local job listing for 30 days on Red Deer Jobs.",
            },
          },
        },
      ],
      metadata: buildJobMetadata(payload),
      success_url: `${origin}/post-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/post`,
    })
  } catch (error) {
    console.error("Stripe session creation error:", error)
    return NextResponse.json(
      {
        error: "Could not create Stripe checkout session.",
        details: stripeErrorMessage(error),
      },
      { status: 500 }
    )
  }

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not create checkout session." },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: session.url })
}
