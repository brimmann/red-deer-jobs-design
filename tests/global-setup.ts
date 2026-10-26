import { deleteAllTestJobs } from "./helpers/supabase"

export default async function globalSetup() {
  await deleteAllTestJobs()
}
