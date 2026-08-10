import { useState } from 'react'
import { motion } from 'framer-motion'
import { Film, Building2, Clapperboard, Ticket, Users, BarChart3 } from 'lucide-react'
import { mockMovies, mockTheatres, mockShowtimes } from '@/data/mockData'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import AnalyticsPanel from './AnalyticsPanel'

const TABS = [
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'theatres', label: 'Theatres', icon: Building2 },
  { id: 'shows', label: 'Shows', icon: Clapperboard },
  { id: 'bookings', label: 'Bookings', icon: Ticket },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('movies')

  return (
    <div className="min-h-screen pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      <h1 className="font-display text-4xl text-white tracking-wide mb-2">Admin Dashboard</h1>
      <p className="text-mist text-sm mb-8">Manage movies, theatres, shows, bookings and users.</p>

      <div className="flex gap-2 overflow-x-auto mb-8 border-b border-line pb-px">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 shrink-0 transition-colors ${
              tab === id ? 'border-marquee text-white' : 'border-transparent text-mist hover:text-white'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'movies' && <MoviesPanel />}
      {tab === 'theatres' && <TheatresPanel />}
      {tab === 'shows' && <ShowsPanel />}
      {tab === 'bookings' && <BookingsPanel />}
      {tab === 'users' && <UsersPanel />}
      {tab === 'analytics' && <AnalyticsPanel />}
    </div>
  )
}

function Table({ headers, children }) {
  return (
    <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-mist-2 text-xs uppercase tracking-wide">
            {headers.map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function MoviesPanel() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-end mb-4"><Button size="sm">+ Add Movie</Button></div>
      <Table headers={['Title', 'Genre', 'Language', 'Rating', 'Status', '']}>
        {mockMovies.map((m) => (
          <tr key={m.id} className="border-b border-line/50 hover:bg-white/[0.02]">
            <td className="px-5 py-3 flex items-center gap-3">
              <img src={m.poster_url} className="w-8 h-11 rounded object-cover" alt="" />
              <span className="text-white font-medium">{m.title}</span>
            </td>
            <td className="px-5 py-3 text-mist">{m.genres.join(', ')}</td>
            <td className="px-5 py-3 text-mist">{m.language}</td>
            <td className="px-5 py-3 text-gold">{m.rating}</td>
            <td className="px-5 py-3"><Badge tone={m.status === 'now_showing' ? 'gold' : 'violet'}>{m.status.replace('_', ' ')}</Badge></td>
            <td className="px-5 py-3 text-right"><button className="text-mist hover:text-white text-xs">Edit</button></td>
          </tr>
        ))}
      </Table>
    </motion.div>
  )
}

function TheatresPanel() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-end mb-4"><Button size="sm">+ Add Theatre</Button></div>
      <Table headers={['Name', 'City', 'Address', '']}>
        {mockTheatres.map((t) => (
          <tr key={t.id} className="border-b border-line/50 hover:bg-white/[0.02]">
            <td className="px-5 py-3 text-white font-medium">{t.name}</td>
            <td className="px-5 py-3 text-mist">{t.city}</td>
            <td className="px-5 py-3 text-mist">{t.address}</td>
            <td className="px-5 py-3 text-right"><button className="text-mist hover:text-white text-xs">Edit</button></td>
          </tr>
        ))}
      </Table>
    </motion.div>
  )
}

function ShowsPanel() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-end mb-4"><Button size="sm">+ Schedule Show</Button></div>
      <Table headers={['Movie', 'Theatre', 'Date', 'Time', 'Price']}>
        {mockShowtimes.slice(0, 12).map((s) => {
          const movie = mockMovies.find((m) => m.id === s.movie_id)
          const theatre = mockTheatres.find((t) => t.id === s.theatre_id)
          return (
            <tr key={s.id} className="border-b border-line/50 hover:bg-white/[0.02]">
              <td className="px-5 py-3 text-white font-medium">{movie?.title}</td>
              <td className="px-5 py-3 text-mist">{theatre?.name}</td>
              <td className="px-5 py-3 text-mist font-mono-ui">{s.show_date}</td>
              <td className="px-5 py-3 text-mist font-mono-ui">{s.show_time}</td>
              <td className="px-5 py-3 text-gold">₹{s.price_standard}</td>
            </tr>
          )
        })}
      </Table>
    </motion.div>
  )
}

function BookingsPanel() {
  const bookings = JSON.parse(localStorage.getItem('cinebook_demo_bookings') || '[]')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Table headers={['Booking Code', 'Seats', 'Amount', 'Status', 'Date']}>
        {bookings.length === 0 ? (
          <tr><td colSpan={5} className="px-5 py-8 text-center text-mist">No bookings yet in this browser session.</td></tr>
        ) : bookings.map((b) => (
          <tr key={b.id} className="border-b border-line/50 hover:bg-white/[0.02]">
            <td className="px-5 py-3 text-white font-mono-ui">{b.booking_code}</td>
            <td className="px-5 py-3 text-mist font-mono-ui">{b.seat_ids.join(', ')}</td>
            <td className="px-5 py-3 text-gold">₹{b.total_amount}</td>
            <td className="px-5 py-3"><Badge tone="gold">{b.status}</Badge></td>
            <td className="px-5 py-3 text-mist-2 text-xs">{b.created_at?.slice(0, 10)}</td>
          </tr>
        ))}
      </Table>
    </motion.div>
  )
}

function UsersPanel() {
  const demoUser = JSON.parse(localStorage.getItem('cinebook_demo_user') || 'null')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Table headers={['Name', 'Email', 'Role']}>
        {demoUser ? (
          <tr className="border-b border-line/50">
            <td className="px-5 py-3 text-white">{demoUser.full_name}</td>
            <td className="px-5 py-3 text-mist">{demoUser.email}</td>
            <td className="px-5 py-3"><Badge tone="violet">{demoUser.role}</Badge></td>
          </tr>
        ) : (
          <tr><td colSpan={3} className="px-5 py-8 text-center text-mist">In production this lists all rows from public.profiles.</td></tr>
        )}
      </Table>
    </motion.div>
  )
}
