function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function inlineMarkdownToHtml(text: string): string {
  let escaped = escapeHtml(text)
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  escaped = escaped.replace(/__(.+?)__/g, "<strong>$1</strong>")
  escaped = escaped.replace(/\*(.+?)\*/g, "<em>$1</em>")
  escaped = escaped.replace(/_(.+?)_/g, "<em>$1</em>")
  return escaped
}

function looksLikeMarkdown(text: string): boolean {
  return /^#{1,6}\s|^\s*[-*•]\s|^\s*\d+\.\s|\*\*|__|\*[^*]/m.test(text)
}

function isRichHtml(html: string): boolean {
  return /<\s*(p|h[1-6]|ul|ol|li|strong|em|b|i|div|br)\b/i.test(html)
}

function extractBodyHtml(raw: string): string {
  if (typeof DOMParser === "undefined") {
    return raw.trim()
  }
  const doc = new DOMParser().parseFromString(raw, "text/html")
  return doc.body.innerHTML.trim()
}

function normalizeMarkdownInput(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function nextNonEmptyLineIndex(lines: string[], from: number): number {
  for (let i = from; i < lines.length; i += 1) {
    if (lines[i]?.trim()) return i
  }
  return lines.length
}

function isBulletLine(line: string): boolean {
  return /^[-*•]\s+/.test(line.trim())
}

function isOrderedLine(line: string): boolean {
  return /^\d+\.\s+/.test(line.trim())
}

/** Remove empty paragraphs TipTap would render as extra blank lines. */
export function normalizeDraftHtml(html: string): string {
  if (typeof DOMParser === "undefined") {
    return html.trim()
  }
  const doc = new DOMParser().parseFromString(html, "text/html")

  doc.body.querySelectorAll("p").forEach((paragraph) => {
    const text = paragraph.textContent?.replace(/\u00a0/g, " ").trim() ?? ""
    if (!text) {
      paragraph.remove()
    }
  })

  return doc.body.innerHTML.trim()
}

export function markdownToHtml(markdown: string): string {
  const lines = normalizeMarkdownInput(markdown).split("\n")
  const parts: string[] = []
  let index = 0

  while (index < lines.length) {
    const trimmed = lines[index]?.trim() ?? ""
    if (!trimmed) {
      index += 1
      continue
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      const heading = trimmed.replace(/^#{1,6}\s+/, "")
      parts.push(`<h2>${inlineMarkdownToHtml(heading)}</h2>`)
      index += 1
      continue
    }

    if (isBulletLine(trimmed)) {
      const items: string[] = []
      while (index < lines.length) {
        const line = lines[index]?.trim() ?? ""
        if (!line) {
          const next = nextNonEmptyLineIndex(lines, index + 1)
          if (next < lines.length && isBulletLine(lines[next] ?? "")) {
            index = next
            continue
          }
          break
        }
        if (!isBulletLine(line)) break
        const item = line.replace(/^[-*•]\s+/, "")
        items.push(`<li>${inlineMarkdownToHtml(item)}</li>`)
        index += 1
      }
      parts.push(`<ul>${items.join("")}</ul>`)
      continue
    }

    if (isOrderedLine(trimmed)) {
      const items: string[] = []
      while (index < lines.length) {
        const line = lines[index]?.trim() ?? ""
        if (!line) {
          const next = nextNonEmptyLineIndex(lines, index + 1)
          if (next < lines.length && isOrderedLine(lines[next] ?? "")) {
            index = next
            continue
          }
          break
        }
        if (!isOrderedLine(line)) break
        const item = line.replace(/^\d+\.\s+/, "")
        items.push(`<li>${inlineMarkdownToHtml(item)}</li>`)
        index += 1
      }
      parts.push(`<ol>${items.join("")}</ol>`)
      continue
    }

    const paragraphLines: string[] = []
    while (index < lines.length) {
      const line = lines[index]?.trim() ?? ""
      if (!line) break
      if (
        /^#{1,6}\s+/.test(line) ||
        /^[-*•]\s+/.test(line) ||
        /^\d+\.\s+/.test(line)
      ) {
        break
      }
      paragraphLines.push(line)
      index += 1
    }
    parts.push(
      `<p>${inlineMarkdownToHtml(paragraphLines.join(" "))}</p>`
    )
  }

  return parts.join("")
}

function plainTextToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block.replace(/\n/g, " "))}</p>`)
    .join("")
}

export function clipboardDraftToHtml({
  html,
  plain,
}: {
  html: string
  plain: string
}): string {
  const text = plain.trim()
  if (!text && !html.trim()) return ""

  if (text && looksLikeMarkdown(text)) {
    return normalizeDraftHtml(markdownToHtml(text))
  }

  const bodyHtml = html ? extractBodyHtml(html) : ""
  if (bodyHtml && isRichHtml(bodyHtml)) {
    return normalizeDraftHtml(bodyHtml)
  }

  if (!text) return ""

  return normalizeDraftHtml(plainTextToHtml(text))
}

export async function readClipboardDraft(): Promise<{
  html: string
  plain: string
}> {
  let plain = ""
  let html = ""

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard.read) {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        if (item.types.includes("text/plain")) {
          plain = await (await item.getType("text/plain")).text()
        }
        if (item.types.includes("text/html")) {
          html = await (await item.getType("text/html")).text()
        }
      }
    }
  } catch {
    // Fall back to readText below.
  }

  if (!plain.trim()) {
    plain = await navigator.clipboard.readText()
  }

  return { html, plain }
}
