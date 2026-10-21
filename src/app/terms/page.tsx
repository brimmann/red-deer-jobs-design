import type { Metadata } from "next"
import Link from "next/link"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const SUPPORT_EMAIL = "support@reddeerjobs.ca"

export const metadata: Metadata = {
  title: "Terms & Privacy | Red Deer Jobs",
  description:
    "Plain-English terms, privacy, and refund policy for the Red Deer Jobs local job board.",
}

const privacyPoints = [
  "We only collect emails to send job alerts or management links for posted jobs.",
  "We use secure payment processors (Stripe) and never store credit card info.",
  "We will NEVER sell, rent, or share your email with third parties or spammers.",
] as const

const employerPoints = [
  "All jobs must be real, legal, and local to Red Deer and surrounding areas.",
  "No multi-level marketing (MLM), scams, or adult content.",
  "The $49 posting fee is final once a job is approved and published.",
] as const

const disclaimerPoints = [
  "We are a local bridge connecting job seekers and employers.",
  "We do not run background checks or guarantee hiring outcomes for either party.",
] as const

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-4 pl-1">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-base leading-relaxed text-foreground"
        >
          <span
            className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <header className="flex flex-col items-start gap-6 pb-14">
            <Badge variant="secondary" className="rounded-xl px-3 py-1 text-sm">
              Last updated: October 21, 2026
            </Badge>
            <div className="flex max-w-2xl flex-col gap-4">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-tight">
                Terms &amp; Privacy
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                No legal jargon. Just plain English on how we handle your data
                and run this board.
              </p>
            </div>
          </header>

          <div className="flex flex-col gap-16 border-t pt-14">
            <section aria-labelledby="privacy-heading">
              <h2
                id="privacy-heading"
                className="mb-6 text-xl font-semibold tracking-tight text-foreground"
              >
                Privacy — what we collect &amp; why
              </h2>
              <BulletList items={privacyPoints} />
            </section>

            <Separator />

            <section aria-labelledby="employer-heading">
              <h2
                id="employer-heading"
                className="mb-6 text-xl font-semibold tracking-tight text-foreground"
              >
                Employer rules &amp; refund policy
              </h2>
              <BulletList items={employerPoints} />
            </section>

            <Separator />

            <section aria-labelledby="disclaimer-heading">
              <h2
                id="disclaimer-heading"
                className="mb-6 text-xl font-semibold tracking-tight text-foreground"
              >
                Disclaimer — protecting the platform
              </h2>
              <BulletList items={disclaimerPoints} />
            </section>

            <Separator />

            <section id="contact" aria-labelledby="contact-heading">
              <h2
                id="contact-heading"
                className="mb-6 text-xl font-semibold tracking-tight text-foreground"
              >
                Contact us
              </h2>
              <p className="text-base leading-relaxed text-foreground">
                Questions about your data or a job post? Email us at{" "}
                <Link
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {SUPPORT_EMAIL}
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
