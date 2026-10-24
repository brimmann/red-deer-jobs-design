"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Check } from "lucide-react"

import { updateAdminJob } from "@/app/admin/actions"
import { isJobDescriptionEmpty } from "@/lib/jobs/map-admin-job-form"
import type { ManageJobFormValues } from "@/lib/jobs/manage-job"

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

type AdminEditListingFormProps = {
  jobId: string
  listingTitle: string
  initialValues: ManageJobFormValues
  onDiscard: () => void
  onSaved: () => void
}

export function AdminEditListingForm({
  jobId,
  listingTitle,
  initialValues,
  onDiscard,
  onSaved,
}: AdminEditListingFormProps) {
  const router = useRouter()
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
  const [employerEmail, setEmployerEmail] = useState(
    initialValues.employerEmail
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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
    if (!employerEmail.trim()) {
      next.employerEmail = "Employer email is required."
    } else if (!emailPattern.test(employerEmail.trim())) {
      next.employerEmail = "Enter a valid email address."
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

  function resetToInitial() {
    setTitle(initialValues.title)
    setCompany(initialValues.company)
    setAddressLine(initialValues.addressLine)
    setEmploymentSetup(initialValues.employmentSetup)
    setPayAmountMin(initialValues.payAmountMin)
    setPayAmountMax(initialValues.payAmountMax)
    setPayPreset(initialValues.payPreset as PayPreset | null)
    setDescription(initialValues.description)
    setApplyTo(initialValues.applyTo)
    setEmployerEmail(initialValues.employerEmail)
    setErrors({})
    setSubmitted(false)
  }

  function handleDiscard() {
    resetToInitial()
    onDiscard()
  }

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
      const result = await updateAdminJob(
        jobId,
        {
          title,
          company,
          addressLine,
          employmentSetup,
          payAmountMin,
          payAmountMax,
          payPreset,
          description,
          applyTo,
        },
        employerEmail
      )
      if (result.error) {
        showToast(result.error, "error")
        return
      }
      showToast("Listing saved.")
      router.refresh()
      onSaved()
    } catch {
      showToast("Could not save changes.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Edit listing
        </h2>
        <p className="text-sm text-muted-foreground">
          Update <span className="font-medium text-foreground">{listingTitle}</span>{" "}
          and save, or discard to return to the list without saving.
        </p>
      </header>

      <form onSubmit={onSave} className="flex flex-col gap-6" noValidate>
        <Card className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-edit-job-title">Job Title</Label>
                <Input
                  id="admin-edit-job-title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value)
                    clearFieldError("title")
                  }}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={
                    errors.title ? "admin-edit-job-title-error" : undefined
                  }
                  className="h-10 rounded-xl"
                />
                <FieldError
                  id="admin-edit-job-title-error"
                  message={errors.title}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-edit-company">Company Name</Label>
                <Input
                  id="admin-edit-company"
                  value={company}
                  onChange={(event) => {
                    setCompany(event.target.value)
                    clearFieldError("company")
                  }}
                  aria-invalid={Boolean(errors.company)}
                  aria-describedby={
                    errors.company ? "admin-edit-company-error" : undefined
                  }
                  className="h-10 rounded-xl"
                />
                <FieldError
                  id="admin-edit-company-error"
                  message={errors.company}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-edit-address">
                  Workplace address{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="admin-edit-address"
                  value={addressLine}
                  onChange={(event) => setAddressLine(event.target.value)}
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
                  id="admin-edit-employment-error"
                  message={errors.employmentTypes}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-3">
                <span className="text-sm font-medium">Pay / Compensation</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="admin-edit-pay-min">Minimum amount</Label>
                    <Input
                      id="admin-edit-pay-min"
                      type="number"
                      min={0}
                      step="any"
                      value={payAmountMin}
                      onChange={(event) => setPayAmountMin(event.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="admin-edit-pay-max">Maximum amount</Label>
                    <Input
                      id="admin-edit-pay-max"
                      type="number"
                      min={0}
                      step="any"
                      value={payAmountMax}
                      onChange={(event) => setPayAmountMax(event.target.value)}
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
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-edit-description">Job Description</Label>
                <JobDescriptionEditor
                  id="admin-edit-description"
                  value={description}
                  onChange={setDescription}
                  onPasteFeedback={showToast}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-edit-apply">Application link or email</Label>
                <Input
                  id="admin-edit-apply"
                  value={applyTo}
                  onChange={(event) => {
                    setApplyTo(event.target.value)
                    clearFieldError("applyTo")
                  }}
                  aria-invalid={Boolean(errors.applyTo)}
                  aria-describedby={
                    errors.applyTo ? "admin-edit-apply-error" : undefined
                  }
                  className="h-10 rounded-xl"
                />
                <FieldError id="admin-edit-apply-error" message={errors.applyTo} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-edit-employer-email">Employer email</Label>
                <Input
                  id="admin-edit-employer-email"
                  type="email"
                  value={employerEmail}
                  onChange={(event) => {
                    setEmployerEmail(event.target.value)
                    clearFieldError("employerEmail")
                  }}
                  aria-invalid={Boolean(errors.employerEmail)}
                  aria-describedby={
                    errors.employerEmail
                      ? "admin-edit-employer-email-error"
                      : undefined
                  }
                  className="h-10 rounded-xl"
                />
                <FieldError
                  id="admin-edit-employer-email-error"
                  message={errors.employerEmail}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Save or discard</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-6 sm:flex-row sm:pb-8">
            <Button
              type="submit"
              size="lg"
              className="h-11 flex-1 rounded-xl"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 flex-1 rounded-xl"
              disabled={isSaving}
              onClick={handleDiscard}
            >
              Discard
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
