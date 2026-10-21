import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, DollarSign, Heart, MapPin } from "lucide-react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "About Us | Red Deer Jobs",
  description:
    "Why we built a dedicated local job board for Red Deer — fair fees, verified listings, and jobs that actually belong here.",
}

const pledges = [
  {
    icons: [Heart, MapPin] as const,
    title: "100% Local Focus",
    description:
      "Every job is physically in or based around Red Deer.",
  },
  {
    icons: [DollarSign] as const,
    title: "Fair Business Fees",
    description:
      "Low, flat pricing so local shops can afford to post.",
  },
  {
    icons: [CheckCircle] as const,
    title: "Zero Fake Jobs",
    description:
      "We verify postings to keep out national recruitment spam.",
  },
] as const

export default function AboutPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <header className="flex flex-col items-start gap-6 pb-14">
            <Badge variant="secondary" className="rounded-xl px-3 py-1 text-sm">
              📍 Made in Red Deer, Alberta
            </Badge>
            <div className="flex max-w-2xl flex-col gap-4">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-tight">
                Built for Red Deer, by Red Deer.
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Why we built a dedicated local job board for our city.
              </p>
            </div>
          </header>

          <div className="flex flex-col gap-6 border-t pt-14 text-base leading-relaxed text-foreground">
            <p>
              Big job sites are full of ghost jobs, nationwide spam, and
              expensive fees that hurt local small businesses. When you are
              hiring in Red Deer—or looking for work here—those platforms
              rarely feel like they were built for you.
            </p>
            <p>
              We created a dedicated space where local employers can hire
              without overpaying, and job seekers do not have to sift through
              irrelevant listings. One board, one community, one place to
              connect people who already live and work in this city.
            </p>
          </div>

          <section className="pt-20" aria-labelledby="pledge-heading">
            <h2
              id="pledge-heading"
              className="mb-10 text-sm font-medium uppercase tracking-wider text-muted-foreground"
            >
              Our local pledge
            </h2>
            <ul className="grid gap-4 sm:grid-cols-3">
              {pledges.map((pledge) => (
                <li key={pledge.title}>
                  <Card className="h-full rounded-xl border-0 shadow-sm">
                    <CardHeader className="gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {pledge.icons.map((Icon, iconIndex) => (
                          <Icon
                            key={`${pledge.title}-${iconIndex}`}
                            className="size-5 shrink-0"
                            aria-hidden
                          />
                        ))}
                      </div>
                      <CardTitle className="text-base font-semibold">
                        {pledge.title}
                      </CardTitle>
                      <CardDescription className="leading-relaxed">
                        {pledge.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <section
          className="border-t bg-muted/40"
          aria-labelledby="about-cta-heading"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-14">
            <div className="flex max-w-md flex-col gap-2">
              <h2
                id="about-cta-heading"
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                Ready to hire or find work locally?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Browse roles from Red Deer employers, or post your opening at a
                flat rate that keeps small business in mind.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-xl"
                )}
              >
                Browse Local Jobs
              </Link>
              <Link
                href="/post"
                className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
              >
                Post a Job ($49)
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
