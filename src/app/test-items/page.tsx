import { Suspense } from "react"

import { TestItemsList } from "@/components/test-items-list"

export default function TestItemsPage() {
  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-4 text-xl font-semibold">test_items</h1>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <TestItemsList />
      </Suspense>
    </main>
  )
}
