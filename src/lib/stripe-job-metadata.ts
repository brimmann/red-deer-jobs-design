import type { AdminJobFormValues } from "@/lib/jobs/map-admin-job-form"

function readMetadataValue(
  metadata: Record<string, string>,
  key: string
): string {
  if (key in metadata) return metadata[key] ?? ""
  const chunks: string[] = []
  for (let index = 0; ; index += 1) {
    const chunkKey = `${key}__${index}`
    if (!(chunkKey in metadata)) break
    chunks.push(metadata[chunkKey] ?? "")
  }
  return chunks.join("")
}

export function parseCheckoutJobMetadata(
  metadata: Record<string, string> | null | undefined
): (AdminJobFormValues & { employerEmail: string }) | null {
  if (!metadata) return null

  let employmentSetup: string[] = []
  try {
    const raw = readMetadataValue(metadata, "employmentSetup")
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (
      !Array.isArray(parsed) ||
      !parsed.every((item) => typeof item === "string")
    ) {
      return null
    }
    employmentSetup = parsed
  } catch {
    return null
  }

  const title = readMetadataValue(metadata, "title").trim()
  const company = readMetadataValue(metadata, "company").trim()
  const applyTo = readMetadataValue(metadata, "applyTo").trim()
  const employerEmail = readMetadataValue(metadata, "employerEmail").trim()
  const description = readMetadataValue(metadata, "description")

  if (!title || !company || !applyTo || !employerEmail) {
    return null
  }

  const payPresetRaw = readMetadataValue(metadata, "payPreset").trim()

  return {
    title,
    company,
    addressLine: readMetadataValue(metadata, "addressLine"),
    employmentSetup,
    payAmountMin: readMetadataValue(metadata, "payAmountMin"),
    payAmountMax: readMetadataValue(metadata, "payAmountMax"),
    payPreset: payPresetRaw ? payPresetRaw : null,
    description,
    applyTo,
    employerEmail,
  }
}
