import { useState, useEffect } from 'react'
import { getDashboardStats, getRiskTrend } from '../api/students'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, AlertTriangle, CheckCircle, TrendingDown, RefreshCw, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const NeonCard = ({ title, value, trend, color, icon: Icon }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`glass-card p-6 rounded-3xl relative overflow-hidden group border-l-4 ${color}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
        <Icon size={22} className="text-white" />
      </div>
      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
        ↑ {trend}%
      </span>
    </div>
    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">{title}</p>
    <p className="text-4xl font-black text-white mt-1 tracking-tighter">{value ?? '0'}</p>
    {/* Bottom Glow */}
    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 blur-3xl rounded-full" />
  </motion.div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([getDashboardStats(), getRiskTrend()]);
      setStats(s.data); setTrend(t.data);
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-black text-white tracking-tighter">
            Risk <span className="text-red-500">Intelligence</span>
          </motion.h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Real-time cohort monitoring & predictive analysis.</p>
        </div>
        <button onClick={load} className="p-3 glass-card rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90">
          <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <NeonCard title="Total Students" value={stats?.total_students} trend="4.2" icon={Users} color="border-l-blue-500" />
        <NeonCard title="At-Risk Pop." value={stats?.at_risk_count} trend="12.8" icon={AlertTriangle} color="border-l-red-500" />
        <NeonCard title="Pass Probability" value={`${stats?.passing_count}%`} trend="1.6" icon={CheckCircle} color="border-l-emerald-500" />
        <NeonCard title="Model Confidence" value="94.3%" trend="0.4" icon={TrendingDown} color="border-l-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Zap size={20} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Risk Prediction Momentum</h2>
            </div>
            <div className="text-xs text-slate-500 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/10">
              LIVE DATA FEED
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
                <Area type="monotone" dataKey="at_risk" stroke="#ef4444" strokeWidth={4} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border-t border-white/10">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Risk Density
            </h3>
            <div className="space-y-4">
              {stats?.risk_level_distribution ? (
                Object.entries(stats.risk_level_distribution).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default group">
                    <span className={`text-xs font-black ${level === 'CRITICAL' ? 'text-red-400' : 'text-slate-300'}`}>{level}</span>
                    <span className="text-white font-mono font-bold group-hover:scale-110 transition-transform">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs text-center py-8 italic">No data detected</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}