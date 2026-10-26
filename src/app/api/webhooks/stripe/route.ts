import { NextResponse } from "next/server"
import { Resend } from "resend"
import Stripe from "stripe"

import {
  mapAdminJobFormToInsert,
} from "@/lib/jobs/map-admin-job-form"
import { parseCheckoutJobMetadata } from "@/lib/stripe-job-metadata"
import { createAdminClient } from "@/lib/supabase/admin"

const RESEND_FROM = "onboarding@resend.dev" as const

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.")
  }
  return new Stripe(secretKey)
}

function getMissingServiceEnvKeys(): string[] {
  const missing: string[] = []

  if (!process.env.SUPABASE_SECRET_KEY?.trim()) {
    missing.push("SUPABASE_SECRET_KEY")
  }
  if (!process.env.RESEND_API_KEY?.trim()) {
    missing.push("RESEND_API_KEY")
  }
  if (!process.env.TEST_NOTIFICATION_EMAIL?.trim()) {
    missing.push("TEST_NOTIFICATION_EMAIL")
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    missing.push("NEXT_PUBLIC_SITE_URL")
  }

  return missing
}

async function sendManagementLinkEmail(editToken: string): Promise<void> {
  if (process.env.PLAYWRIGHT_MOCK_RESEND === "1") {
    return
  }

  const apiKey = process.env.RESEND_API_KEY!.trim()
  const to = process.env.TEST_NOTIFICATION_EMAIL!.trim()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "")

  const manageUrl = `${siteUrl}/manage-job/${editToken}`
  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from: RESEND_FROM,
    to,
    subject: "Your Job Posting & Management Link",
    html: `<p>Thanks for posting on Red Deer Jobs.</p><p>Use this link to manage your listing:</p><p><a href="${manageUrl}">${manageUrl}</a></p>`,
    text: `Thanks for posting on Red Deer Jobs.\n\nManage your listing:\n${manageUrl}`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    console.error(
      "Stripe webhook rejected: STRIPE_WEBHOOK_SECRET is missing or empty."
    )
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 400 }
    )
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    console.error("Stripe webhook rejected: missing stripe-signature header.")
    return NextResponse.json({ error: "Missing signature." }, { status: 400 })
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error)
    console.error("Stripe webhook signature verification failed:", message)
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 })
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const missingEnv = getMissingServiceEnvKeys()
  if (missingEnv.length > 0) {
    console.error(
      "Stripe webhook cannot process checkout.session.completed; missing env:",
      missingEnv.join(", ")
    )
    return NextResponse.json(
      { error: "Server configuration is incomplete." },
      { status: 500 }
    )
  }

  const session = event.data.object as Stripe.Checkout.Session
  const parsed = parseCheckoutJobMetadata(session.metadata)

  if (!parsed) {
    console.error(
      "Stripe webhook rejected: invalid or incomplete job metadata on checkout session.",
      { sessionId: session.id }
    )
    return NextResponse.json(
      { error: "Invalid session metadata." },
      { status: 400 }
    )
  }

  const { employerEmail, ...formValues } = parsed
  const mapped = mapAdminJobFormToInsert(formValues)

  const row = {
    title: String(mapped.title),
    company_name: String(mapped.company_name),
    pay_range: mapped.pay_range,
    employment_types: [...formValues.employmentSetup].map(String),
    description: String(mapped.description),
    apply_method: mapped.apply_method,
    apply_value: String(mapped.apply_value),
    employer_email: String(employerEmail.trim()),
    status: "pending" as const,
  }

  if (row.employment_types.length === 0) {
    console.error(
      "Stripe webhook rejected: employment_types must be a non-empty string array.",
      { sessionId: session.id }
    )
    return NextResponse.json(
      { error: "Invalid employment types." },
      { status: 400 }
    )
  }

  if (row.apply_method !== "url" && row.apply_method !== "email") {
    console.error(
      "Stripe webhook rejected: apply_method must be url or email.",
      { sessionId: session.id, apply_method: row.apply_method }
    )
    return NextResponse.json(
      { error: "Invalid apply method." },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data, error: insertError } = await supabase
    .from("jobs")
    .insert(row)
    .select("edit_token")
    .single()

  if (insertError) {
    console.error(
      "Stripe webhook Supabase insert failed:",
      insertError.message,
      insertError
    )
    return NextResponse.json(
      { error: "Could not create job." },
      { status: 500 }
    )
  }

  if (!data?.edit_token) {
    console.error(
      "Stripe webhook Supabase insert succeeded but edit_token was not returned.",
      { sessionId: session.id }
    )
    return NextResponse.json(
      { error: "Could not create job." },
      { status: 500 }
    )
  }

  try {
    await sendManagementLinkEmail(data.edit_token)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error)
    console.error("Stripe webhook Resend email failed:", message)
    return NextResponse.json(
      { error: "Could not send notification email." },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
