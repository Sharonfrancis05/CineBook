import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Clock, Calendar, MapPin, Play, ArrowLeft } from 'lucide-react'
import { getMovieById, getShowsForMovie } from '@/lib/api'
import { mockTheatres } from '@/data/mockData'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useBookingStore } from '@/store/bookingStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

const availableDates = Array.from({ length: 4 }).map((_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return d.toISOString().slice(0, 10)
})

export default function MovieDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [selectedDate, setSelectedDate] = useState(availableDates[1]) // Default to tomorrow because seed_data uses tomorrow
  const [selectedTheatre, setSelectedTheatre] = useState('all')
  const [showTrailer, setShowTrailer] = useState(false)
  const { setMovie: setBookingMovie, setShow } = useBookingStore()
  const { user } = useAuthStore()
  const { pushToast } = useUIStore()

  useEffect(() => {
    getMovieById(id).then(setMovie)
    getShowsForMovie(id).then(setShows)
  }, [id])

  if (!movie) {
    return <div className="min-h-screen flex items-center justify-center text-mist">Loading...</div>
  }

  const uniqueTheatres = Array.from(new Map(shows.map(s => [s.theatre.id, s.theatre])).values())

  const filteredShows = shows.filter((s) => 
    s.show_date === selectedDate && 
    (selectedTheatre === 'all' || s.theatre_id === selectedTheatre)
  )
  const showsByTheatre = uniqueTheatres
    .map((t) => ({ theatre: t, times: filteredShows.filter((s) => s.theatre_id === t.id) }))
    .filter((g) => g.times.length > 0)

  function handleSelectShow(show) {
    if (!user) {
      pushToast('Please sign in to book tickets', 'info')
      navigate('/login')
      return
    }
    setBookingMovie(movie)
    setShow(show)
    navigate(`/booking/${show.id}/seats`)
  }

  return (
    <div className="pb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-24 left-4 sm:left-8 z-50 w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:scale-105 transition-transform"
      >
        <ArrowLeft size={20} className="text-white" />
      </button>
      
      {/* Backdrop hero */}
      <section className="relative h-[60vh] min-h-[420px]">
        <img src={movie.backdrop_url} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/20" />
        {movie.trailer_url && (
          <button
            onClick={() => setShowTrailer(true)}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-16 h-16 rounded-full glass-strong flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play size={22} className="text-white ml-1" fill="white" />
            </div>
          </button>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            src={movie.poster_url}
            alt={movie.title}
            className="w-40 md:w-56 rounded-2xl shadow-2xl shrink-0 border border-line"
          />

          <div className="flex-1 pt-4 md:pt-24">
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genres.map((g) => <Badge key={g}>{g}</Badge>)}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl text-white mb-3">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-mist mb-5">
              <span className="flex items-center gap-1 text-gold font-semibold"><Star size={15} fill="currentColor" /> {movie.rating}/10</span>
              <span className="flex items-center gap-1"><Clock size={15} /> {movie.duration_mins} min</span>
              <span className="flex items-center gap-1"><Calendar size={15} /> {movie.release_date}</span>
              <Badge tone="violet">{movie.certificate}</Badge>
              <Badge>{movie.language}</Badge>
            </div>
            <p className="text-mist leading-relaxed max-w-2xl">{movie.synopsis}</p>
          </div>
        </div>

        {/* Cast */}
        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-wide text-white mb-5">Cast</h2>
          <div className="flex gap-5 overflow-x-auto pb-2">
            {movie.cast.map((c) => (
              <div key={c.name} className="text-center shrink-0 w-24">
                <img src={c.photo} alt={c.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-line" />
                <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                <p className="text-[11px] text-mist-2 truncate">{c.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Showtimes */}
        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-wide text-white mb-5">Select Showtime</h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {availableDates.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  selectedDate === d ? 'bg-marquee border-marquee text-white' : 'border-line text-mist hover:text-white'
                }`}
              >
                {new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              </button>
            ))}

            <select
              value={selectedTheatre}
              onChange={(e) => setSelectedTheatre(e.target.value)}
              className="ml-auto bg-white/5 border border-line rounded-xl px-3 py-2 text-sm text-white outline-none"
            >
              <option value="all" className="bg-ink">All Theatres</option>
              {uniqueTheatres.map((t) => <option key={t.id} value={t.id} className="bg-ink">{t.name}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            {showsByTheatre.map(({ theatre, times }) => (
              <div key={theatre.id} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={15} className="text-marquee" />
                  <h3 className="font-semibold text-white">{theatre.name}</h3>
                  <span className="text-xs text-mist-2">{theatre.address}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {times.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectShow(s)}
                      className="px-4 py-2 rounded-lg border border-line text-sm text-mist hover:border-marquee hover:text-white hover:bg-marquee/10 transition-colors font-mono-ui"
                    >
                      {s.show_time}
                      <span className="block text-[10px] text-gold mt-0.5">₹{s.price_standard}+</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showTrailer && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>
          <div className="w-full max-w-3xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe src={movie.trailer_url} title="Trailer" className="w-full h-full rounded-xl" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  )
}
