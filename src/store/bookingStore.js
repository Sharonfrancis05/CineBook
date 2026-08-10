import { create } from 'zustand'

// -----------------------------------------------------------------------
// bookingStore — ephemeral state for the active booking flow:
// show -> seat selection -> payment -> confirmation. Cleared after checkout.
// -----------------------------------------------------------------------
export const useBookingStore = create((set, get) => ({
  selectedMovie: null,
  selectedShow: null,
  selectedSeats: [], // [{id, row, number, tier, price}]
  lastBooking: null,

  setMovie: (movie) => set({ selectedMovie: movie }),
  setShow: (show) => set({ selectedShow: show, selectedSeats: [] }),

  toggleSeat: (seat, price) => {
    const { selectedSeats } = get()
    const exists = selectedSeats.find((s) => s.id === seat.id)
    if (exists) {
      set({ selectedSeats: selectedSeats.filter((s) => s.id !== seat.id) })
    } else {
      if (selectedSeats.length >= 10) return // sane per-booking cap
      set({ selectedSeats: [...selectedSeats, { ...seat, price }] })
    }
  },

  clearSeats: () => set({ selectedSeats: [] }),

  totalAmount: () => {
    const { selectedSeats } = get()
    const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0)
    const convenienceFee = selectedSeats.length > 0 ? Math.round(subtotal * 0.05) : 0
    return { subtotal, convenienceFee, total: subtotal + convenienceFee }
  },

  setLastBooking: (booking) => set({ lastBooking: booking }),

  resetFlow: () => set({ selectedShow: null, selectedSeats: [] }),
}))
