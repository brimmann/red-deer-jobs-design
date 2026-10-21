export function HeroDotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_150%_135%_at_50%_46%,#000_32%,transparent_88%)] [-webkit-mask-image:radial-gradient(ellipse_150%_135%_at_50%_46%,#000_32%,transparent_88%)] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-size:100%_100%] sm:[mask-image:radial-gradient(ellipse_115%_95%_at_50%_32%,#000_22%,transparent_72%)] sm:[-webkit-mask-image:radial-gradient(ellipse_115%_95%_at_50%_32%,#000_22%,transparent_72%)]"
    >
      <svg
        className="size-full text-muted-foreground opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="hero-dot-grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.55" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dot-grid)" />
      </svg>
    </div>
  )
}
