import { cn } from "cn"

const links = [
  { href: "/terms", label: "Terms & Privacy" },
  { href: "/terms#contact", label: "Contact" },
]

export function SiteFooter({
  containerClassName,
}: {
  containerClassName?: string
}) {
  return (
    <footer className="mt-auto border-t">
      <div
        className={cn(
          "mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6",
          containerClassName
        )}
      >
        <p className="text-sm text-muted-foreground">
          © 2026 Red Deer Jobs
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
