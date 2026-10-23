"use client"

import { useActionState } from "react"

import { loginAdmin } from "@/app/admin/actions"
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

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => loginAdmin(formData),
    {}
  )

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-md items-center px-4 py-16 sm:px-6">
      <Card className="w-full rounded-xl shadow-sm">
        <CardHeader className="text-center">
          <CardTitle>Admin access</CardTitle>
          <CardDescription>
            Enter the admin password to manage job listings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="rounded-xl"
                disabled={pending}
              />
            </div>
            {state.error ? (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={pending}
            >
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
