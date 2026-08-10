import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Search, User, Menu, X, LayoutDashboard, LogOut, Ticket } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, profile, signOut, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-lg shadow-black/30' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-marquee to-violet flex items-center justify-center group-hover:scale-105 transition-transform">
            <Film size={18} className="text-white" />
          </div>
          <span className="font-display text-2xl tracking-wider text-white">
            CINE<span className="text-gradient-marquee">BOOK</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-mist">
          <Link to="/" className="hover:text-white transition-colors">Now Showing</Link>
          <Link to="/?status=coming_soon" className="hover:text-white transition-colors">Coming Soon</Link>
          <Link to="/search" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Search size={15} /> Search
          </Link>
          {isAdmin() && (
            <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1.5">
              <LayoutDashboard size={15} /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-marquee flex items-center justify-center text-black font-bold text-sm"
              >
                {(profile?.full_name || user.email || '?').slice(0, 1).toUpperCase()}
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="absolute right-0 mt-3 w-52 glass-strong rounded-xl overflow-hidden shadow-2xl"
                  >
                    <div className="px-4 py-3 border-b border-line">
                      <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Moviegoer'}</p>
                      <p className="text-xs text-mist truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-mist hover:text-white hover:bg-white/5">
                      <Ticket size={15} /> My Bookings
                    </Link>
                    <button
                      onClick={async () => { await signOut(); navigate('/') }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              <User size={15} /> Sign in
            </Button>
          )}
          <button className="md:hidden text-white" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass-strong overflow-hidden"
          >
            <div className="flex flex-col px-4 py-3 gap-3 text-sm text-mist">
              <Link to="/">Now Showing</Link>
              <Link to="/?status=coming_soon">Coming Soon</Link>
              <Link to="/search">Search</Link>
              {isAdmin() && <Link to="/admin">Admin Dashboard</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
