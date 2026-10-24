"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import {
  Check,
  ChevronDown,
  CircleDollarSign,
  CircleHelp,
  Sparkles,
} from "lucide-react"

import { buildJobDescriptionAiPrompt } from "@/lib/job-description-ai"
import { createAdminListing } from "@/app/admin/actions"
import {
  isJobDescriptionEmpty,
} from "@/lib/jobs/map-admin-job-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const EMPLOYMENT_TYPE_BADGES = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Casual",
  "Seasonal",
  "Apprenticeship",
] as const

const WORK_SETUP_BADGES = ["On-Site", "Hybrid", "Remote"] as const

const PAY_PRESETS = [
  "Hourly",
  "Yearly",
  "Commission",
  "Daily",
  "Piece Rate",
  "DOE / Negotiable",
] as const

type PayPreset = (typeof PAY_PRESETS)[number]

type FieldErrors = {
  title?: string
  company?: string
  employmentTypes?: string
  employerEmail?: string
  applyTo?: string
}

const JobDescriptionEditor = dynamic(
  () =>
    import("@/components/job-description-editor").then(
      (mod) => mod.JobDescriptionEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="h-[9.5rem] rounded-xl border border-input bg-transparent"
      />
    ),
  }
)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isApplicationUrlOrEmail(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (emailPattern.test(trimmed)) return true
  try {
    const href =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`
    const url = new URL(href)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}

type PostJobFormProps = {
  variant?: "public" | "admin"
}

export function PostJobForm({ variant = "public" }: PostJobFormProps) {
  const isAdmin = variant === "admin"
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [addressLine, setAddressLine] = useState("")
  const [employmentSetup, setEmploymentSetup] = useState<string[]>(["Full-Time"])
  const [payAmountMin, setPayAmountMin] = useState("")
  const [payAmountMax, setPayAmountMax] = useState("")
  const [payPreset, setPayPreset] = useState<PayPreset | null>(null)
  const [description, setDescription] = useState("")
  const [applyTo, setApplyTo] = useState("")
  const [employerEmail, setEmployerEmail] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    variant: "success" | "error"
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [formVersion, setFormVersion] = useState(0)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  function showToast(message: string, variant: "success" | "error" = "success") {
    setToast({ message, variant })
  }

  async function copyAiPrompt() {
    const prompt = buildJobDescriptionAiPrompt({
      title,
      company,
      payAmountMin,
      payAmountMax,
      payPreset,
    })
    try {
      await navigator.clipboard.writeText(prompt)
      showToast("AI prompt copied. Paste it into your chatbot.")
    } catch {
      showToast("Could not copy to clipboard.", "error")
    }
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!title.trim()) next.title = "Job title is required."
    if (!company.trim()) next.company = "Company name is required."
    if (employmentSetup.length === 0) {
      next.employmentTypes =
        "Select at least one employment type or work setup option."
    }
    if (!isAdmin) {
      if (!employerEmail.trim()) {
        next.employerEmail = "Your email is required."
      } else if (!emailPattern.test(employerEmail.trim())) {
        next.employerEmail = "Enter a valid email address."
      }
    }
    if (!applyTo.trim()) {
      next.applyTo = "Enter an application link or email."
    } else if (!isApplicationUrlOrEmail(applyTo)) {
      next.applyTo = "Enter a valid URL or email address."
    }
    return next
  }

  function resetFormFields() {
    setTitle("")
    setCompany("")
    setAddressLine("")
    setEmploymentSetup(["Full-Time"])
    setPayAmountMin("")
    setPayAmountMax("")
    setPayPreset(null)
    setDescription("")
    setApplyTo("")
    setEmployerEmail("")
    setSubmitted(false)
    setErrors({})
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isJobDescriptionEmpty(description)) {
      showToast("Job description is required.", "error")
      return
    }

    if (!isAdmin) {
      const formData = {
        title,
        company,
        addressLine,
        employmentSetup,
        payAmountMin,
        payAmountMax,
        payPreset,
        description,
        applyTo,
        employerEmail,
      }
      console.log("Submit clicked, sending payload:", formData)
      setCheckoutError(null)
      setIsSubmitting(true)
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        let errorData: unknown = null
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: "Invalid response from checkout route." }
        }

        if (!response.ok) {
          console.error("Checkout route error:", errorData)
          setCheckoutError(
            "Failed to create checkout session. Check server logs."
          )
          return
        }

        const data = errorData as { url?: string }
        if (!data.url) {
          console.error("Checkout route error:", errorData)
          setCheckoutError(
            "Failed to create checkout session. Check server logs."
          )
          return
        }

        window.location.assign(data.url)
      } catch (error) {
        console.error("Checkout route error:", error)
        setCheckoutError(
          "Failed to create checkout session. Check server logs."
        )
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createAdminListing({
        title,
        company,
        addressLine,
        employmentSetup,
        payAmountMin,
        payAmountMax,
        payPreset,
        description,
        applyTo,
      })

      if (result.error) {
        showToast(result.error || "Could not publish listing.", "error")
        return
      }

      resetFormFields()
      setFormVersion((version) => version + 1)
      showToast("Listing published successfully.")
    } catch {
      showToast("Could not publish listing.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  function clearFieldError(field: keyof FieldErrors) {
    if (!submitted) return
    setErrors((prev) => {
      if (!prev[field]) return prev
      const { [field]: _, ...rest } = prev
      return rest
    })
  }

  function toggleEmploymentSetup(tag: string) {
    setEmploymentSetup((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    )
    clearFieldError("employmentTypes")
  }

  function renderEmploymentBadge(tag: string) {
    const selected = employmentSetup.includes(tag)
    return (
      <Badge
        key={tag}
        render={<button type="button" />}
        variant={selected ? "default" : "outline"}
        className="h-auto shrink-0 cursor-pointer gap-1 rounded-xl px-2.5 py-1 text-xs"
        aria-pressed={selected}
        onClick={() => toggleEmploymentSetup(tag)}
      >
        {selected ? <Check className="size-3" aria-hidden /> : null}
        {tag}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {isAdmin ? null : (
        <header className="flex flex-col items-center gap-2 text-center">
          <Badge
            variant="secondary"
            className="h-auto gap-1.5 rounded-xl px-3 py-1 text-xs font-medium sm:text-sm"
          >
            <CircleDollarSign className="size-3.5 text-primary sm:size-4" />
            $49 flat rate · 30 days · 100% local reach
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">
            Post a Local Job
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            No account to create—fill in the form, pay once, and your listing
            goes live in Red Deer after a quick review.
          </p>
        </header>
      )}

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-6"
        noValidate
      >
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  name="title"
                  placeholder="e.g. Registered Nurse — Day Shift"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value)
                    clearFieldError("title")
                  }}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? "job-title-error" : undefined}
                  className="h-10 rounded-xl"
                />
                <FieldError id="job-title-error" message={errors.title} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  name="company"
                  placeholder="Your business name"
                  value={company}
                  onChange={(event) => {
                    setCompany(event.target.value)
                    clearFieldError("company")
                  }}
                  aria-invalid={Boolean(errors.company)}
                  aria-describedby={
                    errors.company ? "company-name-error" : undefined
                  }
                  className="h-10 rounded-xl"
                />
                <FieldError id="company-name-error" message={errors.company} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="workplace-address">
                  Workplace address{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="workplace-address"
                  name="addressLine"
                  autoComplete="street-address"
                  placeholder="e.g. 4922 50 Ave, Red Deer, AB"
                  value={addressLine}
                  onChange={(event) => setAddressLine(event.target.value)}
                  aria-describedby="workplace-address-hint"
                  className="h-10 rounded-xl"
                />
                <p
                  id="workplace-address-hint"
                  className="text-sm text-muted-foreground"
                >
                  Exact street address in Red Deer if you want candidates to
                  find the workplace easily.
                </p>
              </div>

              <div
                className="flex flex-col gap-3"
                aria-describedby={
                  errors.employmentTypes ? "employment-type-error" : undefined
                }
              >
                <span className="text-sm font-medium">
                  Employment Type &amp; Setup (Select all that apply)
                </span>
                <div
                  className="flex flex-col gap-2"
                  role="group"
                  aria-label="Employment types"
                >
                  <span className="text-xs text-muted-foreground">Types</span>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 flex-nowrap sm:mx-0 sm:flex-wrap sm:overflow-visible">
                    {EMPLOYMENT_TYPE_BADGES.map((tag) =>
                      renderEmploymentBadge(tag)
                    )}
                  </div>
                </div>
                <div
                  className="flex flex-col gap-2"
                  role="group"
                  aria-label="Work setup"
                >
                  <span className="text-xs text-muted-foreground">Setup</span>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 flex-nowrap sm:mx-0 sm:flex-wrap sm:overflow-visible">
                    {WORK_SETUP_BADGES.map((tag) => renderEmploymentBadge(tag))}
                  </div>
                </div>
                <FieldError
                  id="employment-type-error"
                  message={errors.employmentTypes}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-3">
                <span className="text-sm font-medium">Pay / Compensation</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pay-amount-min">Minimum amount</Label>
                    <Input
                      id="pay-amount-min"
                      name="payAmountMin"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      placeholder="25"
                      value={payAmountMin}
                      onChange={(event) => setPayAmountMin(event.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pay-amount-max">Maximum amount</Label>
                    <Input
                      id="pay-amount-max"
                      name="payAmountMax"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      placeholder="30"
                      value={payAmountMax}
                      onChange={(event) => setPayAmountMax(event.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>
                <div
                  className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 flex-nowrap sm:mx-0 sm:flex-wrap sm:overflow-visible"
                  role="group"
                  aria-label="Pay format presets"
                >
                  {PAY_PRESETS.map((preset) => {
                    const selected = payPreset === preset
                    return (
                      <Badge
                        key={preset}
                        render={<button type="button" />}
                        variant={selected ? "default" : "outline"}
                        className="h-auto shrink-0 cursor-pointer rounded-xl px-2.5 py-1 text-xs"
                        aria-pressed={selected}
                        onClick={() =>
                          setPayPreset((current) =>
                            current === preset ? null : preset
                          )
                        }
                      >
                        {preset}
                      </Badge>
                    )
                  })}
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter numbers only—use the badges below for hourly, yearly, or
                  other formats. Leave maximum blank for a fixed rate.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="job-description">Job Description</Label>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 rounded-xl text-xs"
                      onClick={() => void copyAiPrompt()}
                    >
                      <Sparkles className="size-3.5" aria-hidden />
                      Copy AI Prompt
                    </Button>
                    <div className="group/copy-ai-help relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-7 rounded-full text-muted-foreground"
                        aria-label="About Copy AI Prompt"
                      >
                        <CircleHelp className="size-3.5" aria-hidden />
                      </Button>
                      <div
                        role="tooltip"
                        className="invisible absolute right-0 top-full z-50 mt-1.5 w-60 rounded-xl border bg-card p-2.5 text-xs leading-relaxed text-muted-foreground opacity-0 shadow-md transition-opacity group-hover/copy-ai-help:visible group-hover/copy-ai-help:opacity-100 group-focus-within/copy-ai-help:visible group-focus-within/copy-ai-help:opacity-100"
                      >
                        Optional: Copies an AI prompt based on your job details. Paste it into your AI chat, copy the generated response, and click Paste AI Draft to drop it in.
                      </div>
                    </div>
                  </div>
                </div>
                <JobDescriptionEditor
                  key={formVersion}
                  id="job-description"
                  value={description}
                  onChange={setDescription}
                  onPasteFeedback={showToast}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="apply-to">Application link or email</Label>
                <Input
                  id="apply-to"
                  name="applyTo"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://yourcompany.com/careers/role or hiring@yourcompany.com"
                  value={applyTo}
                  onChange={(event) => {
                    setApplyTo(event.target.value)
                    clearFieldError("applyTo")
                  }}
                  aria-invalid={Boolean(errors.applyTo)}
                  aria-describedby={
                    errors.applyTo ? "apply-to-error" : "apply-to-hint"
                  }
                  className="h-10 rounded-xl"
                />
                <FieldError id="apply-to-error" message={errors.applyTo} />
                <p id="apply-to-hint" className="text-sm text-muted-foreground">
                  Paste a careers page or form URL, or an inbox where candidates
                  should send applications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isAdmin ? null : (
          <Card className="rounded-xl border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Your email &amp; access</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pb-6 sm:pb-8">
              <div className="flex flex-col gap-2">
                <Label htmlFor="employer-email" className="text-base">
                  Your email
                </Label>
                <Input
                  id="employer-email"
                  name="employerEmail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={employerEmail}
                  onChange={(event) => {
                    setEmployerEmail(event.target.value)
                    clearFieldError("employerEmail")
                  }}
                  aria-invalid={Boolean(errors.employerEmail)}
                  aria-describedby={
                    errors.employerEmail ? "employer-email-error" : undefined
                  }
                  className="h-11 rounded-xl border-border bg-background text-base shadow-sm ring-1 ring-foreground/10"
                />
                <FieldError
                  id="employer-email-error"
                  message={errors.employerEmail}
                />
              </div>
              <details className="group rounded-xl border border-border bg-muted/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                  How magic links work
                  <ChevronDown
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div
                  id="employer-email-help"
                  className="flex flex-col gap-2 border-t border-border px-3 py-2.5 text-sm text-muted-foreground"
                >
                  <p>
                    We send a magic link to this address for every job you post.
                    Open it to edit, renew, or close that listing—no account or
                    password required.
                  </p>
                  <p>
                    Each posting gets its own secure link in your inbox so you
                    can manage jobs separately without signing up.
                  </p>
                </div>
              </details>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-xl border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>
              {isAdmin ? "Publish listing" : "Checkout — $49"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pb-6 sm:pb-8">
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
              {isAdmin ? (
                <>
                  <li>Listing goes live on the board immediately</li>
                  <li>You can edit or unpublish it from this admin dashboard</li>
                </>
              ) : (
                <>
                  <li>Your job will be online for 30 days</li>
                  <li>Payment receipt and magic links emailed to you</li>
                </>
              )}
            </ul>
            {!isAdmin && checkoutError ? (
              <p
                className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {checkoutError}
              </p>
            ) : null}
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full rounded-xl"
              disabled={isSubmitting}
            >
              {isAdmin
                ? isSubmitting
                  ? "Publishing…"
                  : "Publish Listing Immediately"
                : isSubmitting
                  ? "Redirecting to Stripe..."
                  : "Pay $49 & Publish Job"}
            </Button>
          </CardContent>
        </Card>
      </form>
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-xl border bg-card px-4 py-2.5 text-sm shadow-md"
        >
          <span
            className={
              toast.variant === "error" ? "text-destructive" : "text-foreground"
            }
          >
            {toast.message}
          </span>
        </div>
      ) : null}
    </div>
  )
}
