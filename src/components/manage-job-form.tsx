"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Check } from "lucide-react"

import {
  expireManagedJob,
  updateManagedJob,
} from "@/app/manage-job/[token]/actions"
import {
  isJobDescriptionEmpty,
} from "@/lib/jobs/map-admin-job-form"
import type {
  ManageJobFormValues,
  ManageJobStatusLabel,
} from "@/lib/jobs/manage-job"

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

function statusBadgeVariant(
  status: ManageJobStatusLabel
): "default" | "secondary" | "outline" {
  switch (status) {
    case "Live":
      return "default"
    case "Expired":
      return "outline"
    default:
      return "secondary"
  }
}

type ManageJobFormProps = {
  token: string
  statusLabel: ManageJobStatusLabel
  initialValues: ManageJobFormValues
}

export function ManageJobForm({
  token,
  statusLabel,
  initialValues,
}: ManageJobFormProps) {
  const router = useRouter()
  const isExpired = statusLabel === "Expired"
  const [title, setTitle] = useState(initialValues.title)
  const [company, setCompany] = useState(initialValues.company)
  const [addressLine, setAddressLine] = useState(initialValues.addressLine)
  const [employmentSetup, setEmploymentSetup] = useState<string[]>(
    initialValues.employmentSetup
  )
  const [payAmountMin, setPayAmountMin] = useState(initialValues.payAmountMin)
  const [payAmountMax, setPayAmountMax] = useState(initialValues.payAmountMax)
  const [payPreset, setPayPreset] = useState<PayPreset | null>(
    initialValues.payPreset as PayPreset | null
  )
  const [description, setDescription] = useState(initialValues.description)
  const [applyTo, setApplyTo] = useState(initialValues.applyTo)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    variant: "success" | "error"
  } | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  function showToast(message: string, variant: "success" | "error" = "success") {
    setToast({ message, variant })
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!title.trim()) next.title = "Job title is required."
    if (!company.trim()) next.company = "Company name is required."
    if (employmentSetup.length === 0) {
      next.employmentTypes =
        "Select at least one employment type or work setup option."
    }
    if (!applyTo.trim()) {
      next.applyTo = "Enter an application link or email."
    } else if (!isApplicationUrlOrEmail(applyTo)) {
      next.applyTo = "Enter a valid URL or email address."
    }
    return next
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
    if (isExpired) return
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
        render={<button type="button" disabled={isExpired} />}
        variant={selected ? "default" : "outline"}
        className="h-auto shrink-0 cursor-pointer gap-1 rounded-xl px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
        aria-pressed={selected}
        onClick={() => toggleEmploymentSetup(tag)}
      >
        {selected ? <Check className="size-3" aria-hidden /> : null}
        {tag}
      </Badge>
    )
  }

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isExpired) return

    setSubmitted(true)
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isJobDescriptionEmpty(description)) {
      showToast("Job description is required.", "error")
      return
    }

    setIsSaving(true)
    try {
      const result = await updateManagedJob(token, {
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
        showToast(result.error, "error")
        return
      }
      showToast("Listing updated.")
      router.refresh()
    } catch {
      showToast("Could not save changes.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  async function onDelete() {
    if (isExpired) return
    const confirmed = window.confirm(
      "Remove this job listing? It will be marked expired and taken off the board."
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const result = await expireManagedJob(token)
      if (result.error) {
        showToast(result.error, "error")
        return
      }
      showToast("Listing removed.")
      router.refresh()
    } catch {
      showToast("Could not remove listing.", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <Badge
          variant={statusBadgeVariant(statusLabel)}
          className="h-auto rounded-xl px-3 py-1 text-xs font-medium sm:text-sm"
        >
          {statusLabel}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">
          Manage Your Job Posting
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Update details below or remove the listing. Changes to live posts may
          take a moment to appear after review policies apply.
        </p>
      </header>

      <form onSubmit={onSave} className="flex flex-col gap-6" noValidate>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="manage-job-title">Job Title</Label>
                <Input
                  id="manage-job-title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value)
                    clearFieldError("title")
                  }}
                  disabled={isExpired}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={
                    errors.title ? "manage-job-title-error" : undefined
                  }
                  className="h-10 rounded-xl"
                />
                <FieldError id="manage-job-title-error" message={errors.title} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="manage-company">Company Name</Label>
                <Input
                  id="manage-company"
                  value={company}
                  onChange={(event) => {
                    setCompany(event.target.value)
                    clearFieldError("company")
                  }}
                  disabled={isExpired}
                  aria-invalid={Boolean(errors.company)}
                  aria-describedby={
                    errors.company ? "manage-company-error" : undefined
                  }
                  className="h-10 rounded-xl"
                />
                <FieldError
                  id="manage-company-error"
                  message={errors.company}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="manage-address">
                  Workplace address{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="manage-address"
                  value={addressLine}
                  onChange={(event) => setAddressLine(event.target.value)}
                  disabled={isExpired}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">
                  Employment Type &amp; Setup
                </span>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground">Types</span>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 flex-nowrap sm:mx-0 sm:flex-wrap sm:overflow-visible">
                    {EMPLOYMENT_TYPE_BADGES.map((tag) =>
                      renderEmploymentBadge(tag)
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground">Setup</span>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 flex-nowrap sm:mx-0 sm:flex-wrap sm:overflow-visible">
                    {WORK_SETUP_BADGES.map((tag) => renderEmploymentBadge(tag))}
                  </div>
                </div>
                <FieldError
                  id="manage-employment-error"
                  message={errors.employmentTypes}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-3">
                <span className="text-sm font-medium">Pay / Compensation</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="manage-pay-min">Minimum amount</Label>
                    <Input
                      id="manage-pay-min"
                      type="number"
                      min={0}
                      step="any"
                      value={payAmountMin}
                      onChange={(event) => setPayAmountMin(event.target.value)}
                      disabled={isExpired}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="manage-pay-max">Maximum amount</Label>
                    <Input
                      id="manage-pay-max"
                      type="number"
                      min={0}
                      step="any"
                      value={payAmountMax}
                      onChange={(event) => setPayAmountMax(event.target.value)}
                      disabled={isExpired}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 flex-nowrap sm:mx-0 sm:flex-wrap sm:overflow-visible">
                  {PAY_PRESETS.map((preset) => {
                    const selected = payPreset === preset
                    return (
                      <Badge
                        key={preset}
                        render={<button type="button" disabled={isExpired} />}
                        variant={selected ? "default" : "outline"}
                        className="h-auto shrink-0 cursor-pointer rounded-xl px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
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
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="manage-description">Job Description</Label>
                <JobDescriptionEditor
                  id="manage-description"
                  value={description}
                  onChange={setDescription}
                  onPasteFeedback={showToast}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="manage-apply">Application link or email</Label>
                <Input
                  id="manage-apply"
                  value={applyTo}
                  onChange={(event) => {
                    setApplyTo(event.target.value)
                    clearFieldError("applyTo")
                  }}
                  disabled={isExpired}
                  aria-invalid={Boolean(errors.applyTo)}
                  aria-describedby={
                    errors.applyTo ? "manage-apply-error" : undefined
                  }
                  className="h-10 rounded-xl"
                />
                <FieldError id="manage-apply-error" message={errors.applyTo} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="manage-employer-email">Your email</Label>
                <Input
                  id="manage-employer-email"
                  type="email"
                  value={initialValues.employerEmail}
                  readOnly
                  disabled
                  className="h-10 rounded-xl bg-muted/50"
                />
                <p className="text-sm text-muted-foreground">
                  Contact email is tied to your magic link and cannot be changed
                  here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Save or remove</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-6 sm:flex-row sm:pb-8">
            <Button
              type="submit"
              size="lg"
              className="h-11 flex-1 rounded-xl"
              disabled={isExpired || isSaving || isDeleting}
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="h-11 flex-1 rounded-xl"
              disabled={isExpired || isSaving || isDeleting}
              onClick={() => void onDelete()}
            >
              {isDeleting ? "Removing…" : "Remove Listing"}
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
