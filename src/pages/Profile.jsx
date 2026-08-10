import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Calendar, MapPin, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getMyBookings } from '@/lib/api'
import Badge from '@/components/ui/Badge'

export default function Profile() {
  const { user, profile } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getMyBookings(user.id).then((data) => {
      setBookings(data)
      setLoading(false)
    })
  }, [user])

  return (
    <div className="min-h-screen pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-marquee flex items-center justify-center text-black font-bold text-2xl">
          {(profile?.full_name || user?.email || '?').slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-3xl text-white tracking-wide">{profile?.full_name || 'Moviegoer'}</h1>
          <p className="text-mist text-sm">{user?.email}</p>
        </div>
      </div>

      <h2 className="font-display text-2xl tracking-wide text-white mb-5 flex items-center gap-2">
        <Ticket size={20} className="text-marquee" /> My Bookings
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-ink-2 animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-mist">No bookings yet — go find something great to watch.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-ink-2 shrink-0 overflow-hidden">
                {b.show?.movie?.poster_url && <img src={b.show.movie.poster_url} className="w-full h-full object-cover" alt="" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{b.show?.movie?.title || 'Movie'}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-mist mt-1">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {b.created_at?.slice(0, 10)}</span>
                  <span className="font-mono-ui">{b.seat_ids?.join(', ')}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <Badge tone={b.status === 'confirmed' ? 'gold' : 'mist'}>{b.status}</Badge>
                <p className="text-white font-semibold mt-1">₹{b.total_amount}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
