"use client"

import { useState } from "react"
import { Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AlertSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle")

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) {
      setStatus("error")
      return
    }
    setStatus("success")
    setEmail("")
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-4 text-primary" />
          Daily job alerts
        </CardTitle>
        <CardDescription>
          A short morning email when new Red Deer roles are posted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alert-email">Email</Label>
            <Input
              id="alert-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (status !== "idle") setStatus("idle")
              }}
              aria-invalid={status === "error"}
              aria-describedby="alert-status"
              className="h-10 rounded-xl"
            />
          </div>
          <Button type="submit" variant="secondary" className="rounded-xl">
            Get alerts
          </Button>
          <p
            id="alert-status"
            className={
              status === "error"
                ? "text-sm text-destructive"
                : "text-sm text-primary"
            }
            role="status"
          >
            {status === "error"
              ? "Enter a valid email address."
              : status === "success"
                ? "You are on the daily Red Deer list."
                : null}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
