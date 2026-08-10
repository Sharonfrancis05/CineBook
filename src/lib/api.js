import { supabase, isSupabaseConfigured } from './supabase'
import {
  mockMovies,
  mockTheatres,
  mockShowtimes,
  mockScreens,
  generateSeatMap,
} from '@/data/mockData'

// -----------------------------------------------------------------------
// api.js — every screen calls these functions instead of touching
// Supabase or mock data directly. Swapping demo -> production requires
// zero component changes: just set the VITE_SUPABASE_* env vars.
// -----------------------------------------------------------------------

export async function getMovies({ search = '', genre = 'All', language = 'All', status = 'now_showing' } = {}) {
  if (!isSupabaseConfigured) {
    let list = mockMovies.filter((m) => m.status === status)
    if (search) list = list.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    if (genre !== 'All') list = list.filter((m) => m.genres.includes(genre))
    if (language !== 'All') list = list.filter((m) => m.language === language)
    return list
  }

  let query = supabase.from('movies').select('*').eq('status', status)
  if (search) query = query.ilike('title', `%${search}%`)
  if (language !== 'All') query = query.eq('language', language)
  const { data, error } = await query
  if (error) throw error
  const results = genre !== 'All' ? data.filter((m) => m.genres.includes(genre)) : data
  return results.map(m => ({ ...m, cast: m.cast_json }))
}

export async function getMovieById(id) {
  if (!isSupabaseConfigured) return mockMovies.find((m) => m.id === id)
  const { data, error } = await supabase.from('movies').select('*').eq('id', id).single()
  if (error) throw error
  return { ...data, cast: data.cast_json }
}

export async function getShowsForMovie(movieId) {
  if (!isSupabaseConfigured) {
    return mockShowtimes
      .filter((s) => s.movie_id === movieId)
      .map((s) => ({
        ...s,
        theatre: mockTheatres.find((t) => t.id === s.theatre_id),
        screen: mockScreens.find((sc) => sc.id === s.screen_id),
      }))
  }
  const { data, error } = await supabase
    .from('shows')
    .select('*, theatre:theatres(*), screen:screens(*)')
    .eq('movie_id', movieId)
    .gte('show_date', new Date().toISOString().slice(0, 10))
  if (error) throw error
  return data.map(show => ({
    ...show,
    show_time: show.show_time ? show.show_time.slice(0, 5) : show.show_time
  }))
}

export async function getSeatMap(showId) {
  if (!isSupabaseConfigured) {
    // Simulate a handful of already-booked seats for demo realism
    const fakeBooked = ['C4', 'C5', 'D6', 'F2', 'F3', 'F4', 'H10']
    return generateSeatMap(showId, fakeBooked)
  }
  const { data: seats, error } = await supabase
    .from('seat_status')
    .select('*')
    .eq('show_id', showId)
  if (error) throw error
  // Map seat_id to id if missing, or fallback to row_label-seat_number to ensure unique IDs for selection
  return seats.map(s => ({
    ...s,
    id: s.id || s.seat_id || `${s.row_label}-${s.seat_number}`
  }))
}

export async function createBooking({ userId, showId, seatIds, totalAmount }) {
  if (!isSupabaseConfigured) {
    const booking = {
      id: crypto.randomUUID(),
      user_id: userId,
      show_id: showId,
      seat_ids: seatIds,
      total_amount: totalAmount,
      status: 'confirmed',
      booking_code: Math.random().toString(36).slice(2, 9).toUpperCase(),
      created_at: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem('cinebook_demo_bookings') || '[]')
    localStorage.setItem('cinebook_demo_bookings', JSON.stringify([booking, ...existing]))
    return booking
  }

  // In production this calls a Postgres function (see sql/schema.sql:
  // book_seats()) that locks the seats, validates availability, and
  // inserts booking + booking_seats rows inside a single transaction —
  // preventing race conditions between simultaneous bookers.
  const { data, error } = await supabase.rpc('book_seats', {
    p_show_id: showId,
    p_seat_ids: seatIds,
  })
  if (error) throw error
  return data
}

export async function getMyBookings(userId) {
  if (!isSupabaseConfigured) {
    const all = JSON.parse(localStorage.getItem('cinebook_demo_bookings') || '[]')
    return all.filter((b) => b.user_id === userId)
  }
  const { data, error } = await supabase
    .from('bookings')
    .select('*, show:shows(*, movie:movies(*), theatre:theatres(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Realtime subscription: fires whenever seat_status changes for a show,
// so every open browser tab sees seats lock/free instantly.
export function subscribeToSeatChanges(showId, onChange) {
  if (!isSupabaseConfigured) return () => {}
  const channel = supabase
    .channel(`seats-${showId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'booking_seats', filter: `show_id=eq.${showId}` },
      onChange
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}
