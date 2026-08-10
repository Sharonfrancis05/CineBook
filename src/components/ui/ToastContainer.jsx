import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-400" />,
  error: <XCircle size={18} className="text-red-400" />,
  info: <Info size={18} className="text-violet" />,
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useUIStore()

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            onClick={() => dismissToast(t.id)}
            className="glass-strong rounded-xl px-4 py-3 flex items-center gap-2.5 cursor-pointer shadow-xl"
          >
            {icons[t.type]}
            <p className="text-sm text-white/90">{t.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
