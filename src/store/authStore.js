import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// -----------------------------------------------------------------------
// authStore — single source of truth for the logged-in user.
// In demo mode (no Supabase env vars) it simulates auth in memory so the
// whole app can still be exercised end to end.
// -----------------------------------------------------------------------
export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null, // row from public.profiles (role, full_name, avatar_url...)
  loading: true,
  initialized: false,

  init: async () => {
    if (!isSupabaseConfigured) {
      // Demo mode: check localStorage for a fake session
      const saved = localStorage.getItem('cinebook_demo_user')
      set({ user: saved ? JSON.parse(saved) : null, profile: saved ? JSON.parse(saved) : null, loading: false, initialized: true })
      return
    }

    const { data } = await supabase.auth.getSession()
    if (data.session) {
      await get().hydrateProfile(data.session.user)
    } else {
      set({ loading: false, initialized: true })
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        get().hydrateProfile(session.user)
      } else {
        set({ user: null, profile: null })
      }
    })

    return subscription
  },


  hydrateProfile: async (authUser) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
    set({ user: authUser, profile, loading: false, initialized: true })
  },

  signUp: async (email, password, fullName) => {
    if (!isSupabaseConfigured) {
      const fake = { id: crypto.randomUUID(), email, full_name: fullName, role: 'customer' }
      localStorage.setItem('cinebook_demo_user', JSON.stringify(fake))
      set({ user: fake, profile: fake })
      return { error: null }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (!error && data.user) await get().hydrateProfile(data.user)
    return { error }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      const fake = { id: crypto.randomUUID(), email, full_name: email.split('@')[0], role: 'customer' }
      localStorage.setItem('cinebook_demo_user', JSON.stringify(fake))
      set({ user: fake, profile: fake })
      return { error: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.user) await get().hydrateProfile(data.user)
    return { error }
  },

  signInWithGoogle: async () => {
    if (!isSupabaseConfigured) {
      const fake = { id: crypto.randomUUID(), email: 'demo.google@cinebook.app', full_name: 'Google Demo User', role: 'customer' }
      localStorage.setItem('cinebook_demo_user', JSON.stringify(fake))
      set({ user: fake, profile: fake })
      return { error: null }
    }
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  },

  signOut: async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('cinebook_demo_user')
      set({ user: null, profile: null })
      return
    }
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  isAdmin: () => get().profile?.role === 'admin',
}))
