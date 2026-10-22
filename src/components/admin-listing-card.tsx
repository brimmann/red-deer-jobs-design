"use client"

import { useState } from "react"
import {
  Building2,
  Calendar,
  ChevronDown,
  CircleDollarSign,
  Link2,
  Mail,
  MapPin,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AdminListing, AdminListingStatus } from "@/lib/admin-listings"
import { cn } from "cn"

type AdminListingCardProps = {
  listing: AdminListing
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onUnpublish?: (id: string) => void
  onEdit?: (id: string) => void
  onRepublish?: (id: string) => void
  onDelete?: (id: string) => void
}

function StatusBadge({ status }: { status: AdminListingStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-auto rounded-xl px-2.5 py-0.5 text-xs font-medium",
        status === "Pending" &&
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100",
        status === "Live" &&
          "border-primary/25 bg-primary/10 text-primary dark:bg-primary/20",
        status === "Expired" &&
          "border-border bg-muted text-muted-foreground"
      )}
    >
      {status}
    </Badge>
  )
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
      <dt className="shrink-0 text-xs font-medium text-muted-foreground sm:w-28">
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-foreground">{children}</dd>
    </div>
  )
}

export function AdminListingCard({
  listing,
  onApprove,
  onReject,
  onUnpublish,
  onEdit,
  onRepublish,
  onDelete,
}: AdminListingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const {
    id,
    title,
    company,
    employerEmail,
    postedDate,
    status,
    pay,
    employmentTypes,
    setup,
    workplaceAddress,
    description,
    applyTo,
  } = listing

  const detailsId = `listing-details-${id}`

  return (
    <Card className="rounded-xl border bg-card shadow-sm">
      <CardHeader className="gap-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base font-semibold leading-snug sm:text-lg">
                {title}
              </CardTitle>
              <StatusBadge status={status} />
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Building2 className="size-4 shrink-0 text-muted-foreground/80" />
                <span className="truncate">{company}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-muted-foreground/80" />
                <span className="truncate">{employerEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="size-4 shrink-0 text-muted-foreground/80" />
                <span>Posted {postedDate}</span>
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-between rounded-xl sm:w-auto sm:min-w-40"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Hide details" : "View details"}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
        </Button>

        {expanded ? (
          <div
            id={detailsId}
            className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4"
          >
            <dl className="flex flex-col gap-3">
              <DetailRow label="Pay">
                <span className="inline-flex items-center gap-1.5">
                  <CircleDollarSign
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  {pay}
                </span>
              </DetailRow>
              <DetailRow label="Employment">
                <div className="flex flex-wrap gap-1.5">
                  {employmentTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="h-auto rounded-xl px-2 py-0.5 text-xs"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </DetailRow>
              <DetailRow label="Setup">
                <div className="flex flex-wrap gap-1.5">
                  {setup.map((item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="h-auto rounded-xl px-2 py-0.5 text-xs"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </DetailRow>
              {workplaceAddress ? (
                <DetailRow label="Location">
                  <span className="inline-flex items-start gap-1.5">
                    <MapPin
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    {workplaceAddress}
                  </span>
                </DetailRow>
              ) : null}
              <DetailRow label="Apply via">
                <span className="inline-flex items-start gap-1.5 break-all">
                  <Link2
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  {applyTo}
                </span>
              </DetailRow>
            </dl>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Description
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {description}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {status === "Pending" ? (
            <>
              <Button
                type="button"
                className="h-9 w-full rounded-xl sm:w-auto"
                onClick={() => onApprove?.(id)}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-9 w-full rounded-xl sm:w-auto"
                onClick={() => onReject?.(id)}
              >
                Reject
              </Button>
            </>
          ) : null}
          {status === "Live" ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full rounded-xl sm:w-auto"
                onClick={() => onUnpublish?.(id)}
              >
                Unpublish / Archive
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full rounded-xl sm:w-auto"
                onClick={() => onEdit?.(id)}
              >
                Edit
              </Button>
            </>
          ) : null}
          {status === "Expired" ? (
            <>
              <Button
                type="button"
                className="h-9 w-full rounded-xl sm:w-auto"
                onClick={() => onRepublish?.(id)}
              >
                Republish
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-9 w-full rounded-xl sm:w-auto"
                onClick={() => onDelete?.(id)}
              >
                Delete
              </Button>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
