import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, Download, Ticket } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import Button from '@/components/ui/Button'

export default function TicketConfirmation() {
  const navigate = useNavigate()
  const { lastBooking } = useBookingStore()

  if (!lastBooking) {
    navigate('/')
    return null
  }

  const qrPayload = JSON.stringify({
    bookingCode: lastBooking.booking_code,
    movie: lastBooking.movie?.title,
    seats: lastBooking.seats.map((s) => s.id),
    show: `${lastBooking.show?.show_date} ${lastBooking.show?.show_time}`,
  })

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-md mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={30} className="text-emerald-400" />
        </div>
        <h1 className="font-display text-3xl text-white tracking-wide">Booking Confirmed</h1>
        <p className="text-mist text-sm mt-1">Your e-ticket is ready — show the QR code at entry.</p>
      </motion.div>

      {/* Ticket stub design */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-strong rounded-2xl overflow-hidden"
      >
        <img src={lastBooking.movie?.backdrop_url} alt="" className="w-full h-32 object-cover" />
        <div className="p-6">
          <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest mb-2">
            <Ticket size={13} /> E-Ticket
          </div>
          <h2 className="font-display text-2xl text-white mb-1">{lastBooking.movie?.title}</h2>
          <p className="text-xs text-mist font-mono-ui mb-6">
            {lastBooking.show?.show_date} · {lastBooking.show?.show_time} · {lastBooking.show?.screen?.name}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-mist-2 text-xs">Seats</p>
              <p className="text-white font-semibold font-mono-ui">{lastBooking.seats.map((s) => s.id).join(', ')}</p>
            </div>
            <div>
              <p className="text-mist-2 text-xs">Amount Paid</p>
              <p className="text-gold font-semibold">₹{lastBooking.total_amount}</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-void" />
            <div className="absolute -right-9 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-void" />
            <div className="border-t-2 border-dashed border-line" />
          </div>

          <div className="flex flex-col items-center pt-6">
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG value={qrPayload} size={140} />
            </div>
            <p className="text-xs text-mist-2 mt-3 font-mono-ui tracking-widest">{lastBooking.booking_code}</p>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3 mt-6">
        <Button variant="ghost" className="flex-1" onClick={() => window.print()}>
          <Download size={15} /> Save Ticket
        </Button>
        <Button className="flex-1" onClick={() => navigate('/profile')}>
          My Bookings
        </Button>
      </div>
    </div>
  )
}
