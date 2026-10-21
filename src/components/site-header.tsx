import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

const navLinks = [{ href: "/about", label: "About" }] as const

export function SiteHeader({
  containerClassName,
}: {
  containerClassName?: string
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-3xl items-center gap-4 px-4 sm:px-6",
          containerClassName
        )}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
            RD
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Red Deer Jobs
          </span>
        </Link>
        <nav
          className="ml-auto flex items-center gap-1 sm:gap-2"
          aria-label="Main"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:px-3"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/post"
            className={cn(
              buttonVariants(),
              "ml-1 rounded-xl sm:ml-2"
            )}
          >
            Post a Job
          </Link>
        </nav>
      </div>
    </header>
  )
}
