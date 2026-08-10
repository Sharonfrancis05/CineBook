import { useEffect, useMemo, useState, useRef } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { getMovies } from '@/lib/api'
import { mockMovies } from '@/data/mockData'
import MovieCard from '@/components/movies/MovieCard'
import Button from '@/components/ui/Button'

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Romance', 'Comedy', 'Horror', 'Mystery', 'Family', 'Thriller']
const LANGUAGES = ['All', 'English', 'Hindi']

export default function Home() {
  const [params] = useSearchParams()
  const status = params.get('status') === 'coming_soon' ? 'coming_soon' : 'now_showing'

  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('All')
  const [language, setLanguage] = useState('All')
  const location = useLocation()
  const searchRef = useRef(null)

  useEffect(() => {
    if (location.pathname === '/search' && searchRef.current) {
      searchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => searchRef.current.focus(), 500)
    }
  }, [location.pathname])

  const heroMovie = useMemo(() => {
    if (movies.length === 0) return null
    const interstellar = movies.find(m => m.title.toLowerCase().includes('interstella'))
    return interstellar || movies[0]
  }, [movies])

  useEffect(() => {
    setLoading(true)
    getMovies({ search, genre, language, status })
      .then(setMovies)
      .finally(() => setLoading(false))
  }, [search, genre, language, status])

  return (
    <div className="pb-20">
      {/* ---------------- Hero marquee ---------------- */}
      <section className="relative h-[78vh] min-h-[520px] flex items-end overflow-hidden">
        {heroMovie && (
          <>
            <img
              src={heroMovie.backdrop_url}
              alt={heroMovie.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-void/90 via-void/20 to-transparent" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-16 w-full"
            >
              <p className="text-gold font-semibold tracking-[0.3em] text-xs mb-3 uppercase">Now Playing</p>
              <h1 className="font-display text-6xl sm:text-8xl text-white leading-none mb-4 max-w-2xl">
                {heroMovie.title}
              </h1>
              <p className="text-mist max-w-lg mb-6 leading-relaxed">{heroMovie.synopsis}</p>
              <div className="flex gap-3">
                <Button size="lg" onClick={() => (window.location.href = `/movie/${heroMovie.id}`)}>
                  Book Tickets
                </Button>
                <Button variant="ghost" size="lg" onClick={() => (window.location.href = `/movie/${heroMovie.id}`)}>
                  Watch Trailer
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </section>

      {/* ---------------- Filters ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="glass-strong rounded-2xl p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-line">
            <Search size={16} className="text-mist" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies, genres..."
              className="bg-transparent outline-none text-sm text-white placeholder:text-mist-2 w-full"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <SlidersHorizontal size={14} className="text-mist-2 shrink-0" />
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  genre === g
                    ? 'bg-marquee text-white border-marquee'
                    : 'bg-transparent text-mist border-line hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/5 border border-line rounded-xl px-3 py-2.5 text-sm text-white outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l} className="bg-ink">{l}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ---------------- Grid ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <h2 className="font-display text-3xl tracking-wide text-white mb-6">
          {status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-ink-2 animate-pulse" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-24 text-mist">
            <p className="text-lg">No movies match your filters.</p>
            <p className="text-sm text-mist-2 mt-1">Try clearing search or picking a different genre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {movies.map((m, i) => (
              <MovieCard key={m.id} movie={m} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
