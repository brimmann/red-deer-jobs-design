export function buildJobDescriptionAiPrompt({
  title,
  company,
  payAmountMin,
  payAmountMax,
  payPreset,
}: {
  title: string
  company: string
  payAmountMin: string
  payAmountMax: string
  payPreset: string | null
}): string {
  const payParts: string[] = []
  if (payAmountMin.trim() && payAmountMax.trim()) {
    payParts.push(`${payAmountMin.trim()} – ${payAmountMax.trim()}`)
  } else if (payAmountMin.trim()) {
    payParts.push(payAmountMin.trim())
  } else if (payAmountMax.trim()) {
    payParts.push(payAmountMax.trim())
  }
  if (payPreset) payParts.push(`(${payPreset})`)
  const payLine = payParts.length > 0 ? payParts.join(" ") : "Not specified"

  return `Write a concise, friendly job description for a local job board in Red Deer, Alberta.

Job title: ${title.trim() || "Not specified"}
Company: ${company.trim() || "Not specified"}
Pay: ${payLine}

Include a short role overview, day-to-day responsibilities as a bullet list, and requirements as a bullet list. Keep it scannable and under 250 words. Use plain language—no corporate buzzwords.

Format the reply in Markdown only: use ## for section headings and - for bullet lists (no HTML).`
}
