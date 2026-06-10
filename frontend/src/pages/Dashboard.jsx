import { useState, useEffect } from 'react'
import { getDashboardStats, getRiskTrend } from '../api/students'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { AlertTriangle, Users, TrendingDown, CheckCircle, RefreshCw, ArrowUpRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass p-6 rounded-2xl flex items-center gap-5 hover:border-white/20 transition-all group"
  >
    <div className={`p-4 rounded-2xl ${color} transition-transform group-hover:scale-110 duration-300`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">{title}</p>
      <p className="text-3xl font-bold text-white mt-1">{value ?? '0'}</p>
    </div>
  </motion.div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [s, t] = await Promise.all([getDashboardStats(), getRiskTrend()])
      setStats(s.data || {}) // Fallback to empty object
      setTrend(t.data || []) // Fallback to empty array
    } catch (e) { 
      console.error("Dashboard load error:", e) 
    }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Faculty"}')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-white tracking-tight">
            System <span className="text-red-500">Overview</span>
          </motion.h1>
          <p className="text-gray-400 mt-2">Welcome back, <span className="text-white font-semibold">{user.name}</span>.</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm transition-all">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Sync Data
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Analyzing Student Data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Enrolled" value={stats?.total_students} icon={Users} color="bg-blue-600" delay={0.1} />
            <StatCard title="At Risk" value={stats?.at_risk_count} icon={AlertTriangle} color="bg-red-600" delay={0.2} />
            <StatCard title="Critical Alert" value={stats?.critical_count} icon={TrendingDown} color="bg-orange-600" delay={0.3} />
            <StatCard title="Passing" value={stats?.passing_count} icon={CheckCircle} color="bg-emerald-600" delay={0.4} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2 glass p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap size={20} className="text-yellow-400" /> Risk Momentum
                </h2>
                <div className="text-xs text-gray-400">8-Week Projection</div>
              </div>
              <div className="h-[300px] w-full">
                {trend && trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                      <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="week" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="at_risk" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
                    No trend data available yet. Predict more students!
                  </div>
                )}
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="glass p-6 rounded-3xl">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Risk Density</h3>
                <div className="space-y-3">
                  {stats?.risk_level_distribution ? (
                    Object.entries(stats.risk_level_distribution).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className={`text-xs font-bold ${level === 'CRITICAL' ? 'text-red-400' : 'text-gray-300'}`}>{level}</span>
                        <span className="text-white font-mono">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs text-center py-4">No distribution data</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}