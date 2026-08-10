import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ToastContainer from '@/components/ui/ToastContainer'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

import Home from '@/pages/Home'
import MovieDetails from '@/pages/MovieDetails'
import SeatSelection from '@/pages/SeatSelection'
import Checkout from '@/pages/Checkout'
import TicketConfirmation from '@/pages/TicketConfirmation'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Profile from '@/pages/Profile'
import AdminDashboard from '@/pages/admin/AdminDashboard'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <ToastContainer />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/booking/:showId/seats" element={
            <ProtectedRoute><SeatSelection /></ProtectedRoute>
          } />
          <Route path="/booking/checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/booking/confirmation" element={
            <ProtectedRoute><TicketConfirmation /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
