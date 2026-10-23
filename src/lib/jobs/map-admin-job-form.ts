const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type AdminJobFormValues = {
  title: string
  company: string
  addressLine: string
  employmentSetup: string[]
  payAmountMin: string
  payAmountMax: string
  payPreset: string | null
  description: string
  applyTo: string
}

export type JobInsertRow = {
  title: string
  company_name: string
  pay_range: string | null
  employment_types: string[]
  description: string
  apply_method: "url" | "email"
  apply_value: string
  employer_email: string
  status: "live"
}

function formatCurrencyAmount(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return trimmed
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}k`
  }
  return `$${trimmed}`
}

export function formatPayRange(
  payAmountMin: string,
  payAmountMax: string,
  payPreset: string | null
): string | null {
  const min = formatCurrencyAmount(payAmountMin)
  const max = formatCurrencyAmount(payAmountMax)
  const preset = payPreset?.trim() ?? ""

  let amountPart: string | null = null
  if (min && max) {
    amountPart = `${min} – ${max}`
  } else if (min) {
    amountPart = min
  } else if (max) {
    amountPart = max
  }

  if (preset === "DOE / Negotiable" && !amountPart) {
    return preset
  }

  if (!amountPart) {
    return preset || null
  }

  const suffix =
    preset === "Hourly"
      ? " / hr"
      : preset === "Yearly"
        ? " / yr"
        : preset === "Daily"
          ? " / day"
          : preset === "Commission"
            ? " + commission"
            : preset === "Piece Rate"
              ? " / piece"
              : preset
                ? ` · ${preset}`
                : ""

  return `${amountPart}${suffix}`.trim() || null
}

function buildDescription(description: string, addressLine: string): string {
  const addr = addressLine.trim()
  const body = description.trim()
  if (!addr) return body
  const addressBlock = `<p><strong>Workplace address:</strong> ${addr}</p>`
  return body ? `${addressBlock}${body}` : addressBlock
}

export function isJobDescriptionEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().length === 0
}

function resolveApplyMethod(applyTo: string): "url" | "email" {
  return emailPattern.test(applyTo.trim()) ? "email" : "url"
}

function resolveEmployerEmail(applyTo: string): string {
  const trimmed = applyTo.trim()
  if (emailPattern.test(trimmed)) return trimmed
  return "admin-seed@reddeerjobs.ca"
}

export function mapAdminJobFormToInsert(
  values: AdminJobFormValues
): JobInsertRow {
  const applyValue = values.applyTo.trim()

  return {
    title: values.title.trim(),
    company_name: values.company.trim(),
    pay_range: formatPayRange(
      values.payAmountMin,
      values.payAmountMax,
      values.payPreset
    ),
    employment_types: values.employmentSetup,
    description: buildDescription(values.description, values.addressLine),
    apply_method: resolveApplyMethod(applyValue),
    apply_value: applyValue,
    employer_email: resolveEmployerEmail(applyValue),
    status: "live",
  }
}
