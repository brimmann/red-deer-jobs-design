const PAY_PRESETS = [
  "Hourly",
  "Yearly",
  "Commission",
  "Daily",
  "Piece Rate",
  "DOE / Negotiable",
] as const

export type ParsedPayRange = {
  payAmountMin: string
  payAmountMax: string
  payPreset: (typeof PAY_PRESETS)[number] | null
}

function unformatAmount(raw: string): string {
  const token = raw.trim().replace(/^\$/, "")
  if (/^\d+k$/i.test(token)) {
    const value = Number(token.slice(0, -1))
    if (Number.isFinite(value)) return String(value * 1000)
  }
  return token
}

function isPayPreset(value: string): value is (typeof PAY_PRESETS)[number] {
  return (PAY_PRESETS as readonly string[]).includes(value)
}

export function parsePayRange(payRange: string | null): ParsedPayRange {
  const empty: ParsedPayRange = {
    payAmountMin: "",
    payAmountMax: "",
    payPreset: null,
  }
  if (!payRange?.trim()) return empty

  let remainder = payRange.trim()
  if (remainder === "DOE / Negotiable") {
    return { ...empty, payPreset: "DOE / Negotiable" }
  }

  let payPreset: ParsedPayRange["payPreset"] = null
  if (remainder.endsWith(" / hr")) {
    payPreset = "Hourly"
    remainder = remainder.slice(0, -" / hr".length).trim()
  } else if (remainder.endsWith(" / yr")) {
    payPreset = "Yearly"
    remainder = remainder.slice(0, -" / yr".length).trim()
  } else if (remainder.endsWith(" / day")) {
    payPreset = "Daily"
    remainder = remainder.slice(0, -" / day".length).trim()
  } else if (remainder.endsWith(" / piece")) {
    payPreset = "Piece Rate"
    remainder = remainder.slice(0, -" / piece".length).trim()
  } else if (remainder.endsWith(" + commission")) {
    payPreset = "Commission"
    remainder = remainder.slice(0, -" + commission".length).trim()
  } else if (remainder.includes(" · ")) {
    const [amountPart, presetPart] = remainder.split(" · ", 2)
    remainder = amountPart.trim()
    const presetCandidate = presetPart.trim()
    if (isPayPreset(presetCandidate)) {
      payPreset = presetCandidate
    }
  }

  const rangeParts = remainder.split(/\s*–\s*/)
  if (rangeParts.length === 2) {
    return {
      payAmountMin: unformatAmount(rangeParts[0]),
      payAmountMax: unformatAmount(rangeParts[1]),
      payPreset,
    }
  }

  if (remainder.startsWith("$")) {
    return {
      payAmountMin: unformatAmount(remainder),
      payAmountMax: "",
      payPreset,
    }
  }

  if (isPayPreset(remainder)) {
    return { ...empty, payPreset: remainder as ParsedPayRange["payPreset"] }
  }

  return empty
}
