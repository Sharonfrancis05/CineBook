import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, Wallet, Lock, ShieldCheck } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { createBooking } from '@/lib/api'
import Button from '@/components/ui/Button'

const METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'wallet', label: 'CineBook Wallet', icon: Wallet },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { selectedMovie, selectedShow, selectedSeats, totalAmount, setLastBooking, resetFlow } = useBookingStore()
  const { user } = useAuthStore()
  const { pushToast } = useUIStore()
  const [method, setMethod] = useState('card')
  const [processing, setProcessing] = useState(false)

  const { subtotal, convenienceFee, total } = totalAmount()

  if (!selectedShow || selectedSeats.length === 0) {
    navigate('/')
    return null
  }

  async function handlePay(e) {
    e.preventDefault()
    setProcessing(true)
    // Simulated payment gateway delay — swap with Stripe/Razorpay in production
    await new Promise((r) => setTimeout(r, 1600))
    try {
      const booking = await createBooking({
        userId: user.id,
        showId: selectedShow.id,
        seatIds: selectedSeats.map((s) => s.id),
        totalAmount: total,
      })
      setLastBooking({ ...booking, movie: selectedMovie, show: selectedShow, seats: selectedSeats })
      resetFlow()
      pushToast('Payment successful! Your ticket is ready.', 'success')
      navigate('/booking/confirmation')
    } catch (err) {
      console.error(err)
      pushToast(`Payment failed: ${err.message || err.toString()}`, 'error')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.4fr_1fr] gap-8">
      <div>
        <h1 className="font-display text-3xl text-white tracking-wide mb-6">Payment</h1>

        <div className="glass rounded-2xl p-6 mb-6">
          <p className="text-sm font-semibold text-white mb-4">Choose payment method</p>
          <div className="grid grid-cols-3 gap-3">
            {METHODS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-xs font-medium transition-colors ${
                  method === id ? 'border-marquee bg-marquee/10 text-white' : 'border-line text-mist hover:text-white'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handlePay} className="glass rounded-2xl p-6 space-y-4">
          {method === 'card' && (
            <>
              <div>
                <label className="text-xs text-mist mb-1.5 block">Card Number</label>
                <input required maxLength={19} placeholder="4242 4242 4242 4242" className="w-full bg-white/5 border border-line rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-marquee font-mono-ui" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-mist mb-1.5 block">Expiry</label>
                  <input required placeholder="MM/YY" className="w-full bg-white/5 border border-line rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-marquee font-mono-ui" />
                </div>
                <div>
                  <label className="text-xs text-mist mb-1.5 block">CVV</label>
                  <input required maxLength={3} placeholder="123" className="w-full bg-white/5 border border-line rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-marquee font-mono-ui" />
                </div>
              </div>
            </>
          )}
          {method === 'upi' && (
            <div>
              <label className="text-xs text-mist mb-1.5 block">UPI ID</label>
              <input required placeholder="yourname@upi" className="w-full bg-white/5 border border-line rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-marquee font-mono-ui" />
            </div>
          )}
          {method === 'wallet' && (
            <p className="text-sm text-mist">CineBook Wallet balance: <span className="text-gold font-semibold">₹2,450</span></p>
          )}

          <div className="flex items-center gap-2 text-xs text-mist-2 pt-2">
            <Lock size={12} /> This is a simulated payment for demo purposes — no real charge occurs.
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={processing}>
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <><ShieldCheck size={16} /> Pay ₹{total}</>
            )}
          </Button>
        </form>
      </div>

      {/* Order summary */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 h-fit">
        <img src={selectedMovie?.backdrop_url} alt="" className="rounded-xl w-full h-32 object-cover mb-4" />
        <h3 className="font-semibold text-white">{selectedMovie?.title}</h3>
        <p className="text-xs text-mist mt-1 font-mono-ui">{selectedShow?.show_date} · {selectedShow?.show_time}</p>
        <div className="h-px bg-line my-4" />
        <div className="text-sm text-mist space-y-2">
          <div className="flex justify-between"><span>Seats</span><span className="text-white">{selectedSeats.map((s) => s.id).join(', ')}</span></div>
          <div className="flex justify-between"><span>Subtotal</span><span className="text-white">₹{subtotal}</span></div>
          <div className="flex justify-between"><span>Convenience fee</span><span className="text-white">₹{convenienceFee}</span></div>
        </div>
        <div className="h-px bg-line my-4" />
        <div className="flex justify-between font-semibold">
          <span className="text-white">Total</span>
          <span className="text-gold text-lg">₹{total}</span>
        </div>
      </motion.div>
    </div>
  )
}
