import {
  deleteAllTestAlertSubscribers,
  deleteAllTestJobs,
} from "./helpers/supabase"

export default async function globalTeardown() {
  await deleteAllTestJobs()
  await deleteAllTestAlertSubscribers()
}
