"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "cn"

export function SaveJobButton() {
  const [saved, setSaved] = useState(false)

  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={saved}
      className="h-10 w-full rounded-xl"
      onClick={() => setSaved((current) => !current)}
    >
      <Bookmark className={cn(saved && "fill-current")} />
      {saved ? "Saved" : "Save Job"}
    </Button>
  )
}
