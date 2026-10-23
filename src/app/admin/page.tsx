import type { Metadata } from "next"
import { cookies } from "next/headers"

import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminLoginForm } from "@/components/admin-login-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSession,
} from "@/lib/admin/session"
import { fetchAllJobsForAdmin } from "@/lib/jobs/admin-jobs"

export const metadata: Metadata = {
  title: "Admin Management | Red Deer Jobs",
  description:
    "Review pending job listings, manage live posts, and publish admin listings for Red Deer Jobs.",
}

export const instant = false

export default async function AdminPage() {
  const cookieStore = await cookies()
  const authed = isValidAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  )

  const listings = authed ? await fetchAllJobsForAdmin() : []

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {authed ? (
          <AdminDashboard listings={listings} />
        ) : (
          <AdminLoginForm />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
