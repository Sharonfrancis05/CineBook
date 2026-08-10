import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Info, ArrowLeft } from 'lucide-react'
import { getSeatMap, subscribeToSeatChanges } from '@/lib/api'
import SeatMap from '@/components/seats/SeatMap'
import Button from '@/components/ui/Button'
import { useBookingStore } from '@/store/bookingStore'
import { useUIStore } from '@/store/uiStore'

export default function SeatSelection() {
  const { showId } = useParams()
  const navigate = useNavigate()
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const { selectedMovie, selectedShow, selectedSeats, toggleSeat, totalAmount } = useBookingStore()
  const { pushToast } = useUIStore()

  const priceMap = {
    standard: selectedShow?.price_standard || 220,
    premium: selectedShow?.price_premium || 320,
  }

  useEffect(() => {
    if (!selectedShow) {
      navigate('/')
      return
    }
    setLoading(true)
    getSeatMap(showId).then((data) => {
      setSeats(data)
      setLoading(false)
    })

    // Live updates: whenever any seat is booked by anyone, refresh the map
    // for every open tab — this is the real-time collaborative piece.
    const unsubscribe = subscribeToSeatChanges(showId, () => {
      getSeatMap(showId).then(setSeats)
      pushToast('Seat availability just updated', 'info')
    })
    return unsubscribe
  }, [showId])

  const { subtotal, convenienceFee, total } = totalAmount()

  return (
    <div className="min-h-screen pt-24 pb-40 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass shrink-0 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">{selectedMovie?.title}</h1>
          <p className="text-sm text-mist mt-1 font-mono-ui">
            {selectedShow?.screen?.name} · {selectedShow?.show_date} · {selectedShow?.show_time}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-2 border-marquee border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 sm:p-10">
          <SeatMap seats={seats} selectedIds={selectedSeats.map((s) => s.id)} onToggle={toggleSeat} priceMap={priceMap} />
        </div>
      )}

      <div className="flex items-start gap-2 mt-6 text-xs text-mist-2">
        <Info size={14} className="shrink-0 mt-0.5" />
        Seats update live for everyone browsing this show — if a seat disappears, someone just booked it.
      </div>

      {/* Sticky checkout bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: selectedSeats.length > 0 ? 0 : 100 }}
        className="fixed bottom-0 inset-x-0 glass-strong border-t border-line z-40"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white font-semibold">
              {selectedSeats.map((s) => `${s.row_label || s.row}${s.seat_number || s.number}`).join(', ') || 'No seats selected'}
            </p>
            <p className="text-xs text-mist mt-0.5">
              ₹{subtotal} + ₹{convenienceFee} fee = <span className="text-gold font-semibold">₹{total}</span>
            </p>
          </div>
          <Button size="lg" disabled={selectedSeats.length === 0} onClick={() => navigate('/booking/checkout')}>
            Proceed to Pay
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
