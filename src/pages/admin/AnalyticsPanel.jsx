import { motion } from 'framer-motion'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { TrendingUp, Percent, Film, MapPin } from 'lucide-react'

// Demo analytics numbers — in production these come from the materialized
// views defined in sql/schema.sql (revenue_by_day, occupancy_by_show, etc.)
// via the Python analytics module (python/analytics.py) or direct queries.
const revenueTrend = [
  { day: 'Mon', revenue: 42000 }, { day: 'Tue', revenue: 38500 }, { day: 'Wed', revenue: 51200 },
  { day: 'Thu', revenue: 47800 }, { day: 'Fri', revenue: 68900 }, { day: 'Sat', revenue: 92300 },
  { day: 'Sun', revenue: 84100 },
]

const topMovies = [
  { name: 'Nebula Protocol', revenue: 184200 },
  { name: 'Ironclad Redemption', revenue: 156800 },
  { name: 'Paper Cranes', revenue: 121400 },
  { name: 'Season of Kites', revenue: 98600 },
  { name: 'Midnight Circuit', revenue: 76200 },
]

const theatreShare = [
  { name: 'CineBook Grand', value: 42 },
  { name: 'CineBook IMAX', value: 35 },
  { name: 'CineBook Lite', value: 23 },
]

const COLORS = ['#e4335a', '#f2b705', '#7c5cff', '#22c55e']

const kpis = [
  { label: 'Total Revenue', value: '₹4,25,800', icon: TrendingUp, tone: 'text-gold' },
  { label: 'Avg. Occupancy', value: '73.4%', icon: Percent, tone: 'text-marquee' },
  { label: 'Shows Today', value: '48', icon: Film, tone: 'text-violet' },
  { label: 'Active Theatres', value: '3', icon: MapPin, tone: 'text-emerald-400' },
]

export default function AnalyticsPanel() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <Icon size={18} className={tone} />
            <p className="text-2xl font-display tracking-wide text-white mt-2">{value}</p>
            <p className="text-xs text-mist mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Revenue Trend (7 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e4335a" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#e4335a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#232330" vertical={false} />
              <XAxis dataKey="day" stroke="#5c5c6e" fontSize={12} />
              <YAxis stroke="#5c5c6e" fontSize={12} />
              <Tooltip contentStyle={{ background: '#121218', border: '1px solid #232330', borderRadius: 10 }} />
              <Area type="monotone" dataKey="revenue" stroke="#e4335a" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Top Movies by Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topMovies} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="#232330" horizontal={false} />
              <XAxis type="number" stroke="#5c5c6e" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#9a9aad" fontSize={11} width={110} />
              <Tooltip contentStyle={{ background: '#121218', border: '1px solid #232330', borderRadius: 10 }} />
              <Bar dataKey="revenue" fill="#f2b705" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Popular Theatres (share of bookings)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={theatreShare} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                {theatreShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12, color: '#9a9aad' }} />
              <Tooltip contentStyle={{ background: '#121218', border: '1px solid #232330', borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6 flex flex-col justify-center">
          <h3 className="font-semibold text-white mb-2">Deeper reports</h3>
          <p className="text-sm text-mist leading-relaxed">
            For cohort analysis, seasonality, and PDF exports, run the Python module at{' '}
            <code className="text-gold font-mono-ui">python/analytics.py</code>. It connects directly to Supabase
            Postgres with <code className="text-gold font-mono-ui">pandas</code> and renders interactive{' '}
            <code className="text-gold font-mono-ui">plotly</code> charts as standalone HTML reports — see the
            project README for usage.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
