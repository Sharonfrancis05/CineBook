import clsx from 'clsx'

const tones = {
  gold: 'bg-gold/15 text-gold border-gold/30',
  marquee: 'bg-marquee/15 text-marquee border-marquee/30',
  violet: 'bg-violet/15 text-violet border-violet/30',
  mist: 'bg-white/5 text-mist border-line',
}

export default function Badge({ children, tone = 'mist', className = '' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
