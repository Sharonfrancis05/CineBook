import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Film, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import Button from '@/components/ui/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuthStore()
  const { pushToast } = useUIStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return pushToast('Please check your email to confirm your account.', 'error')
      }
      return pushToast(error.message, 'error')
    }
    pushToast('Welcome back!', 'success')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-marquee to-violet flex items-center justify-center mb-3">
            <Film size={22} className="text-white" />
          </div>
          <h1 className="font-display text-3xl text-white tracking-wide">Welcome Back</h1>
          <p className="text-mist text-sm mt-1">Sign in to continue booking</p>
        </div>

        <div className="glass rounded-2xl p-6">


          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2 bg-white/5 border border-line rounded-xl px-3 py-2.5">
              <Mail size={15} className="text-mist" />
              <input required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent outline-none text-sm text-white w-full" />
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-line rounded-xl px-3 py-2.5">
              <Lock size={15} className="text-mist" />
              <input required type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent outline-none text-sm text-white w-full" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-mist hover:text-white transition-colors focus:outline-none">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-mist mt-5">
          New to CineBook? <Link to="/signup" className="text-marquee font-semibold">Create an account</Link>
        </p>
      </motion.div>
    </div>
  )
}
