export function JobDetailSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10"
      aria-busy="true"
      aria-label="Loading job details"
    >
      <div className="h-10 w-40 animate-pulse rounded-xl bg-muted" />
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="h-9 w-4/5 max-w-md animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-2/3 max-w-sm animate-pulse rounded-md bg-muted" />
        <div className="flex gap-2">
          <div className="h-6 w-24 animate-pulse rounded-4xl bg-muted" />
          <div className="h-6 w-20 animate-pulse rounded-4xl bg-muted" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-6 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}
