import type { CheckoutJobPayload } from "@/lib/checkout-job-payload"

export async function startPostJobCheckout(
  payload: CheckoutJobPayload
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data: { url?: string; error?: string } = await response.json()

  if (!response.ok) {
    return {
      ok: false,
      error: data.error ?? "Could not start checkout.",
    }
  }

  if (!data.url) {
    return { ok: false, error: "Could not start checkout." }
  }

  window.location.assign(data.url)
  return { ok: true }
}
