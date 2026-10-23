export function RecentJobsFeedSkeleton() {
  return (
    <div
      className="flex flex-col gap-3"
      aria-busy="true"
      aria-label="Loading recent jobs"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-xl border bg-muted/40"
        />
      ))}
    </div>
  )
}
