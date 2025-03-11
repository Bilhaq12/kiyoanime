import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Make sure we have environment variables before creating the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create the client if we have the required environment variables
let supabase: ReturnType<typeof createClient<Database>> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
} else {
  console.error("Supabase credentials are missing. Make sure environment variables are properly set.")
}

// Function to safely get the Supabase client
export function getSupabase() {
  if (!supabase) {
    throw new Error("Supabase client not initialized. Check your environment variables.")
  }
  return supabase
}

export { supabase }

