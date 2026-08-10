import { Film } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-marquee to-violet flex items-center justify-center">
            <Film size={14} className="text-white" />
          </div>
          <span className="font-display text-lg tracking-wider text-white">
            CINE<span className="text-gradient-marquee">BOOK</span>
          </span>
        </div>

      </div>
    </footer>
  )
}
