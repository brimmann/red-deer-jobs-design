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
}

export const initialAdminListings: AdminListing[] = [
  {
    id: "adm-1",
    title: "Warehouse Associate — Morning Shift",
    company: "Queens Park Logistics",
    employerEmail: "hiring@queensparklogistics.ca",
    postedDate: "Oct 21, 2025",
    status: "Pending",
    pay: "$22 – $26 / hr",
    employmentTypes: ["Full-Time"],
    setup: ["On-Site"],
    workplaceAddress: "Queens Business Park, Red Deer, AB",
    description:
      "Pick, pack, and ship orders from the Queens Business Park warehouse. Morning shift starts at 6:00 AM, Monday through Friday. Pallet jack experience is an asset.",
    applyTo: "https://queensparklogistics.ca/jobs",
  },
  {
    id: "adm-2",
    title: "Registered Nurse — Acute Care",
    company: "Red Deer Regional Care",
    employerEmail: "careers@rdregionalcare.ca",
    postedDate: "Oct 19, 2025",
    status: "Live",
    pay: "$44 – $52 / hr",
    employmentTypes: ["Full-Time"],
    setup: ["On-Site"],
    description:
      "Day and evening rotations on a local acute unit. Current Alberta RN registration required. Schedule posted two weeks ahead.",
    applyTo: "careers@rdregionalcare.ca",
  },
  {
    id: "adm-3",
    title: "Retail Sales Associate",
    company: "Gaetz Avenue Goods",
    employerEmail: "shop@gaetzavenuegoods.ca",
    postedDate: "Sep 28, 2025",
    status: "Expired",
    pay: "$18 – $21 / hr",
    employmentTypes: ["Part-Time"],
    setup: ["On-Site"],
    workplaceAddress: "Gaetz Avenue, Red Deer, AB",
    description:
      "Weekday and Saturday floor shifts. Help customers, run the till, and restock during quieter hours.",
    applyTo: "shop@gaetzavenuegoods.ca",
  },
  {
    id: "adm-4",
    title: "Frontend Developer",
    company: "Prairie Grid",
    employerEmail: "jobs@prairiegrid.ca",
    postedDate: "Oct 22, 2025",
    status: "Pending",
    pay: "$78k – $96k / yr",
    employmentTypes: ["Full-Time"],
    setup: ["Remote", "Hybrid"],
    description:
      "Build product interfaces with React for a Red Deer studio. Remote within Alberta with one office day per month.",
    applyTo: "https://prairiegrid.ca/jobs",
  },
  {
    id: "adm-5",
    title: "Journeyman Electrician",
    company: "Northside Electric",
    employerEmail: "hiring@northsideelectric.ca",
    postedDate: "Oct 10, 2025",
    status: "Live",
    pay: "$42 – $48 / hr",
    employmentTypes: ["Full-Time"],
    setup: ["On-Site"],
    description:
      "Service and new-build work across Red Deer. Valid Alberta ticket and reliable vehicle required.",
    applyTo: "hiring@northsideelectric.ca",
  },
]

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
