import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
// Create a project at https://supabase.com, then run the SQL in /sql/schema.sql
// (see project root) inside the Supabase SQL editor. Copy your Project URL and
// anon/public key into a .env file at the project root:
//
//   VITE_SUPABASE_URL=https://xxxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
//
// Until those are set, CineBook automatically falls back to the local mock
// data in src/data/mockData.js so the UI is fully explorable offline.
// ---------------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    })
  : null

if (!isSupabaseConfigured) {
  console.warn(
    '[CineBook] Supabase env vars missing — running in DEMO MODE with mock data. ' +
      'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file to go live.'
  )
}
