"use client"

import { useEffect } from "react"

export function JobDocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} · Red Deer Jobs`
  }, [title])

  return null
}
