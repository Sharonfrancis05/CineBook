import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Star, Clock } from 'lucide-react'
import Badge from '@/components/ui/Badge'

export default function MovieCard({ movie, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/movie/${movie.id}`} className="group block">
        <div className="relative rounded-2xl overflow-hidden aspect-[2/3] bg-ink-2">
          <img
            src={movie.poster_url}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

          <div className="absolute top-2.5 left-2.5">
            <Badge tone="gold"><Star size={11} fill="currentColor" /> {movie.rating}</Badge>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="glass rounded-lg px-3 py-2 text-xs text-white/90 flex items-center gap-1.5">
              <Clock size={12} /> {movie.duration_mins} min · {movie.certificate}
            </div>
          </motion.div>
        </div>

        <h3 className="mt-3 font-semibold text-white truncate group-hover:text-marquee transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-mist mt-0.5 truncate">{movie.genres.join(' • ')}</p>
      </Link>
    </motion.div>
  )
}
