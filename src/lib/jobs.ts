export type JobCategory =
  | "Trades"
  | "Healthcare"
  | "Retail"
  | "Tech"
  | "Hospitality"
  | "Logistics"

export type JobType = "Full-Time" | "Part-Time"

export type Job = {
  id: string
  title: string
  company: string
  initials: string
  category: JobCategory
  type: JobType
  salary: string
  posted: string
  remote: boolean
  urgent: boolean
  summary: string
  about: string
  responsibilities: string[]
  requirements: string[]
  website?: string
  email?: string
  apply: string
}

export const jobs: Job[] = [
  {
    id: "electrician",
    title: "Journeyman Electrician",
    company: "Northside Electric",
    initials: "NE",
    category: "Trades",
    type: "Full-Time",
    salary: "$42 – $48 / hr",
    posted: "2d ago",
    remote: false,
    urgent: true,
    summary:
      "Service and new-build work across Red Deer. Valid Alberta ticket and a reliable vehicle required.",
    about:
      "Northside Electric is hiring a journeyman for service calls and new-build work across Red Deer. Most days start at the shop and finish on a local residential or light commercial site.",
    responsibilities: [
      "Run service calls and rough-in on residential and light commercial jobs in Red Deer.",
      "Read drawings, pull permits, and leave each site ready for the next trade.",
      "Coordinate materials and schedule changes with the shop.",
      "Show apprentices safe, practical ways to finish the work.",
    ],
    requirements: [
      "A valid Alberta journeyman electrician ticket.",
      "A reliable vehicle and a clean driving record for travel between sites.",
      "Comfort working outdoors through a Red Deer winter.",
      "Willingness to complete a site safety orientation before the first job.",
    ],
    email: "hiring@northsideelectric.ca",
    apply:
      "Email a short note and a copy of your ticket. Northside reviews applications on weekdays and calls people they want to interview. The next step is a phone call with the shop lead. No staffing agency is involved.",
  },
  {
    id: "nurse",
    title: "Registered Nurse",
    company: "Red Deer Regional Care",
    initials: "RC",
    category: "Healthcare",
    type: "Full-Time",
    salary: "$44 – $52 / hr",
    posted: "5h ago",
    remote: false,
    urgent: false,
    summary:
      "Day and evening rotations on a local acute unit. Alberta RN registration must be current.",
    about:
      "Red Deer Regional Care needs a registered nurse for day and evening rotations on a local acute unit. The team is small, the census is steady, and the schedule is posted two weeks ahead.",
    responsibilities: [
      "Provide bedside care for an assigned group of patients.",
      "Complete assessments, give medications, and hand off clearly at shift change.",
      "Work with physicians and allied health on the unit.",
      "Support new nurses during their orientation shifts.",
    ],
    requirements: [
      "Current registered nurse registration in Alberta.",
      "Recent acute-care experience, or readiness to complete unit orientation.",
      "Availability for day and evening rotations, including some weekends.",
      "Current basic life support certification.",
    ],
    website: "https://rdregionalcare.ca/careers",
    email: "careers@rdregionalcare.ca",
    apply:
      "Apply on the employer’s site or by email. Include your registration number and the shifts you can work. A unit manager reads each application and phones shortlisted nurses within a few days.",
  },
  {
    id: "retail",
    title: "Retail Sales Associate",
    company: "Gaetz Avenue Goods",
    initials: "GG",
    category: "Retail",
    type: "Part-Time",
    salary: "$18 – $21 / hr",
    posted: "1d ago",
    remote: false,
    urgent: false,
    summary:
      "Weekday and Saturday shifts on Gaetz Avenue. Experience with a till is helpful, not required.",
    about:
      "Gaetz Avenue Goods is hiring a part-time sales associate for weekday and Saturday shifts. The work is floor sales, fitting rooms, and a straightforward till on Gaetz Avenue.",
    responsibilities: [
      "Greet customers and help them find the right size or product.",
      "Run the till and reset fitting rooms through the day.",
      "Restock shelves and receive small deliveries during quieter hours.",
      "Open or close the store on a rotating Saturday.",
    ],
    requirements: [
      "Availability for weekday hours and at least two Saturdays a month.",
      "A comfortable, straightforward way with customers.",
      "Till experience is helpful and is not required.",
      "Ability to stand for a shift and lift light stock.",
    ],
    email: "shop@gaetzavenuegoods.ca",
    apply:
      "Email a few sentences about when you can work. The store manager reads notes at the shop and invites people in for a short conversation on the floor.",
  },
  {
    id: "frontend",
    title: "Frontend Developer",
    company: "Prairie Grid",
    initials: "PG",
    category: "Tech",
    type: "Full-Time",
    salary: "$78k – $96k / yr",
    posted: "3d ago",
    remote: true,
    urgent: false,
    summary:
      "Product interface work for a Red Deer studio. Remote within Alberta, with one office day each month.",
    about:
      "Prairie Grid is a Red Deer product studio hiring a frontend developer. The role is remote from anywhere in Alberta, with one day in the Red Deer office each month.",
    responsibilities: [
      "Build and refine product interfaces with the design team.",
      "Ship accessible, responsive screens and keep component patterns consistent.",
      "Review pull requests and leave clear notes for a small team.",
      "Join the monthly office day in Red Deer for planning.",
    ],
    requirements: [
      "Strong experience with React and modern CSS.",
      "Recent product work you can walk through.",
      "Ability to work remotely in Alberta and attend one office day a month.",
      "Clear writing for a small distributed team.",
    ],
    website: "https://prairiegrid.ca/jobs",
    apply:
      "Apply on the Prairie Grid site. Share a link to recent work and where in Alberta you are based. They reply within a week with a conversation time or a short pass.",
  },
  {
    id: "mechanic",
    title: "Heavy Duty Mechanic",
    company: "Central Alberta Fleet",
    initials: "CF",
    category: "Trades",
    type: "Full-Time",
    salary: "$36 – $44 / hr",
    posted: "4d ago",
    remote: false,
    urgent: true,
    summary:
      "Shop role on highway tractors and trailers. Journeyperson ticket or a signed apprenticeship required.",
    about:
      "Central Alberta Fleet is hiring a heavy duty mechanic for highway tractors and trailers. The work stays in the Red Deer shop, and the bench is booked out.",
    responsibilities: [
      "Diagnose and repair highway tractors and trailers in the shop.",
      "Complete inspections and document the work so units can return to the road.",
      "Keep your bay and the shared tools in order.",
      "Flag parts early so a job is not waiting on the counter.",
    ],
    requirements: [
      "An Alberta journeyperson ticket, or a signed apprenticeship.",
      "Experience with heavy trucks, trailers, or both.",
      "Willingness to work the posted shop schedule, including some early starts.",
      "Comfort with inspection paperwork.",
    ],
    email: "hiring@centralalbertafleet.ca",
    apply:
      "Email your ticket or apprenticeship status and the earliest date you can start. The shop foreman reviews applications and calls to book a visit to the bay.",
  },
  {
    id: "hygienist",
    title: "Dental Hygienist",
    company: "Ross Street Dental",
    initials: "RD",
    category: "Healthcare",
    type: "Part-Time",
    salary: "$46 – $55 / hr",
    posted: "6d ago",
    remote: false,
    urgent: false,
    summary:
      "Three days a week in a downtown practice. Hygiene registration in Alberta is required.",
    about:
      "Ross Street Dental, a downtown practice, is hiring a dental hygienist for three days a week. Patients are booked in a steady column, with a small front-desk team beside the operatories.",
    responsibilities: [
      "See a booked hygiene column three days a week.",
      "Take radiographs as directed and review home care with patients.",
      "Turn over the operatory between appointments.",
      "Flag findings the dentist should see the same day.",
    ],
    requirements: [
      "Current dental hygiene registration in Alberta.",
      "Experience in a general practice.",
      "The same three weekdays available each week.",
      "Comfort working in a small downtown office.",
    ],
    website: "https://rossstreetdental.ca",
    email: "hello@rossstreetdental.ca",
    apply:
      "Apply on the practice site or by email. Include your registration and the weekdays you can commit to. The office coordinator confirms receipt the same day, and the dentist follows up with a time to visit.",
  },
  {
    id: "warehouse",
    title: "Warehouse Associate",
    company: "Queens Park Logistics",
    initials: "QL",
    category: "Logistics",
    type: "Full-Time",
    salary: "$22 – $26 / hr",
    posted: "8h ago",
    remote: false,
    urgent: false,
    summary:
      "Picking, packing, and shipping from the Queens Business Park warehouse. Morning start.",
    about:
      "Queens Park Logistics is hiring a warehouse associate for picking, packing, and shipping at Queens Business Park. The shift starts in the morning, and the work stays on site.",
    responsibilities: [
      "Pick and pack orders accurately against the day’s list.",
      "Stage outbound freight and apply labels before the carrier arrives.",
      "Keep aisles clear and report damaged stock.",
      "Use a pallet jack safely for heavier pulls.",
    ],
    requirements: [
      "Availability for a morning shift, Monday to Friday.",
      "Comfort on your feet and with the warehouse lifting limit.",
      "Warehouse, stock, or shipping experience is an asset.",
      "Reliable transportation to Queens Business Park.",
    ],
    website: "https://queensparklogistics.ca/jobs",
    apply:
      "Apply on the Queens Park Logistics site. Tell them the earliest morning you can start. A supervisor reviews applications each weekday and invites people for a short walkthrough of the floor.",
  },
  {
    id: "cafe",
    title: "Café Supervisor",
    company: "Downtown Red Deer Coffee",
    initials: "DC",
    category: "Hospitality",
    type: "Part-Time",
    salary: "$19 – $23 / hr",
    posted: "1d ago",
    remote: false,
    urgent: false,
    summary:
      "Opening shifts and a small team on Ross Street. Previous café lead experience preferred.",
    about:
      "Downtown Red Deer Coffee is hiring a café supervisor for opening shifts on Ross Street. The role is part-time and suits someone who has already led a café shift.",
    responsibilities: [
      "Open the café and set the bar for the morning rush.",
      "Lead a small team through service.",
      "Close out the till and leave a short note for the owner.",
      "Keep the prep list current for the afternoon shift.",
    ],
    requirements: [
      "Experience leading a café or coffee-shop shift.",
      "Availability for opening hours, including some weekends.",
      "Food-safe certification, or a plan to complete it before the first shift.",
      "A calm approach during a busy downtown morning.",
    ],
    email: "hello@downtownreddeercoffee.ca",
    apply:
      "Email the cafés you have supervised and which openings you can cover. The owner reads every note and replies with a time to walk through the opening list.",
  },
]

function postedSortKey(posted: string): number {
  const match = posted.match(/^(\d+)(h|d) ago$/)
  if (!match) return Number.POSITIVE_INFINITY
  const amount = Number(match[1])
  return match[2] === "h" ? amount : amount * 24
}

function filterJobsByKeyword(keyword: string): Job[] {
  const query = keyword.trim().toLowerCase()
  const filtered =
    query.length === 0
      ? jobs
      : jobs.filter((job) => {
          const haystack =
            `${job.title} ${job.company} ${job.category} ${job.type}`.toLowerCase()
          return haystack.includes(query)
        })

  return [...filtered].sort(
    (a, b) => postedSortKey(a.posted) - postedSortKey(b.posted)
  )
}

export function searchJobs(keyword = ""): Job[] {
  return filterJobsByKeyword(keyword)
}

export function getRecentJobs(limit = 3, keyword = ""): Job[] {
  return filterJobsByKeyword(keyword).slice(0, limit)
}

export function getJob(id: string): Job | undefined {
  return jobs.find((job) => job.id === id)
}

export function formatPosted(posted: string): string {
  const match = posted.match(/^(\d+)(h|d) ago$/)
  if (!match) return posted
  const amount = Number(match[1])
  const unit = match[2] === "h" ? "hour" : "day"
  return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`
}
