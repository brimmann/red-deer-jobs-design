import type { Metadata } from "next"

import { AdminDashboard } from "@/components/admin-dashboard"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Admin Management | Red Deer Jobs",
  description:
    "Review pending job listings, manage live posts, and publish admin listings for Red Deer Jobs.",
}

export default function AdminPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <AdminDashboard />
      </main>
      <SiteFooter />
    </div>
  )
}
