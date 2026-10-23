import { createClient } from "@/lib/supabase/server"

export async function TestItemsList() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("test_items")
    .select("id, title")
    .order("id")

  if (error) {
    return <p role="alert">Failed to load items: {error.message}</p>
  }

  if (!data?.length) {
    return <p>No items found.</p>
  }

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>
          {item.id}: {item.title}
        </li>
      ))}
    </ul>
  )
}
