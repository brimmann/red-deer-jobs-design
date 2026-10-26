import { deleteAllTestJobs } from "./helpers/supabase"

export default async function globalTeardown() {
  await deleteAllTestJobs()
}
