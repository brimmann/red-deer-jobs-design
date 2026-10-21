import { HomeBoard } from "@/components/home-board"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <div id="top" className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HomeBoard />
      </main>
      <SiteFooter />
    </div>
  )
}
