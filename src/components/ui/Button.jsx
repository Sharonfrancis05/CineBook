import { motion } from 'framer-motion'
import clsx from 'clsx'

const variants = {
  primary: 'bg-gradient-to-r from-marquee to-marquee-dim text-white shadow-lg shadow-marquee/25 hover:shadow-marquee/40',
  gold: 'bg-gradient-to-r from-gold to-amber-500 text-black shadow-lg shadow-gold/20',
  ghost: 'bg-white/5 text-white border border-line hover:bg-white/10',
  outline: 'bg-transparent border border-line text-white hover:border-marquee/60 hover:text-marquee',
  danger: 'bg-red-600/90 text-white hover:bg-red-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      disabled={disabled}
      className={clsx(
        'font-semibold tracking-wide transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
