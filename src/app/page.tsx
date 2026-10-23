import { Suspense } from "react"

import { HomeBoard } from "@/components/home-board"
import { RecentJobsFeed } from "@/components/recent-jobs-feed"
import { RecentJobsFeedSkeleton } from "@/components/recent-jobs-feed-skeleton"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <div id="top" className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HomeBoard
          jobsFeed={
            <Suspense fallback={<RecentJobsFeedSkeleton />}>
              <RecentJobsFeed />
            </Suspense>
          }
        />
      </main>
      <SiteFooter />
    </div>
  )
}
