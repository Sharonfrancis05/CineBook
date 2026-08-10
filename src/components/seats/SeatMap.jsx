import { motion } from 'framer-motion'
import clsx from 'clsx'

// Groups a flat seat list into rows for rendering, splitting into two
// blocks with a center aisle for that "looking at the screen" feel.
function groupByRow(seats) {
  const rows = {}
  seats.forEach((s) => {
    const rowId = s.row_label || s.row
    rows[rowId] = rows[rowId] || []
    rows[rowId].push(s)
  })
  return Object.entries(rows).sort(([a], [b]) => a.localeCompare(b))
}

export default function SeatMap({ seats, selectedIds, onToggle, priceMap }) {
  const rows = groupByRow(seats)

  return (
    <div className="w-full">
      {/* The screen — glowing arc, the room's light source */}
      <div className="relative mb-10 flex flex-col items-center">
        <div
          className="w-[85%] max-w-xl h-2 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
            boxShadow: '0 0 40px 8px rgba(242,183,5,0.35), 0 0 120px 30px rgba(228,51,90,0.12)',
          }}
        />
        <p className="text-[11px] tracking-[0.4em] text-mist-2 mt-3 uppercase">Screen this way</p>
      </div>

      <div className="flex flex-col items-center gap-2 overflow-x-auto pb-2">
        {rows.map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-1.5">
            <span className="w-5 text-[10px] text-mist-2 font-mono-ui shrink-0 text-right mr-1">{row}</span>
            {rowSeats
              .sort((a, b) => (a.seat_number || a.number) - (b.seat_number || b.number))
              .map((seat, idx) => {
                const isSelected = selectedIds.includes(seat.id)
                const isBooked = seat.status === 'booked'
                const isAisle = idx === 3 || idx === 8
                return (
                  <div key={seat.id} className={clsx(isAisle && 'mr-3')}>
                    <motion.button
                      disabled={isBooked}
                      onClick={() => onToggle(seat, priceMap[seat.tier])}
                      whileHover={!isBooked ? { scale: 1.15 } : {}}
                      whileTap={!isBooked ? { scale: 0.9 } : {}}
                      title={`${seat.id} · ${seat.tier} · ₹${priceMap[seat.tier]}`}
                      className={clsx(
                        'w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[9px] font-mono-ui flex items-center justify-center transition-colors border',
                        isBooked && 'bg-mist-2/20 border-transparent text-mist-2 cursor-not-allowed',
                        !isBooked && !isSelected && seat.tier === 'premium' && 'bg-gold/10 border-gold/40 text-gold hover:bg-gold/20',
                        !isBooked && !isSelected && seat.tier === 'standard' && 'bg-white/5 border-line text-mist hover:border-violet/60 hover:text-white',
                        isSelected && 'bg-marquee border-marquee text-white shadow-lg shadow-marquee/40'
                      )}
                    >
                      {seat.seat_number || seat.number}
                    </motion.button>
                  </div>
                )
              })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-5 mt-10 text-xs text-mist">
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-white/5 border border-line inline-block" /> Standard (₹{priceMap.standard})</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-gold/10 border border-gold/40 inline-block" /> Premium (₹{priceMap.premium})</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-marquee inline-block" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-mist-2/20 inline-block" /> Booked</span>
      </div>
    </div>
  )
}
