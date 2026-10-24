import type { ManageJobFormValues } from "@/lib/jobs/manage-job"

export type AdminListingStatus = "Pending" | "Live" | "Expired"

export type AdminListing = {
  id: string
  title: string
  company: string
  employerEmail: string
  postedDate: string
  status: AdminListingStatus
  pay: string
  employmentTypes: string[]
  setup: string[]
  workplaceAddress?: string
  description: string
  applyTo: string
  editFormValues: ManageJobFormValues
}

export function filterAdminListings(
  listings: AdminListing[],
  query: string
): AdminListing[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return listings
  return listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(normalized) ||
      listing.employerEmail.toLowerCase().includes(normalized)
  )
}
