import { useState, useEffect } from 'react'
import { getDashboardStats, getRiskTrend } from '../api/students'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, AlertTriangle, CheckCircle, TrendingDown, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

const StatCard = ({ title, value, trend, colorClass, icon: Icon }) => (
  <div className={`glass-card p-6 rounded-3xl relative overflow-hidden group ${colorClass}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white/5 rounded-lg border border-white/10">
        <Icon size={20} className="text-white" />
      </div>
      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
        ↑ {trend}%
      </span>
    </div>
    <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">{title}</p>
    <p className="text-3xl font-black text-white mt-1">{value ?? '0'}</p>
    {/* Decorative mini-wave at bottom */}
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
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
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time student risk intelligence across all active cohorts.</p>
        </div>
        <button onClick={load} className="p-2 glass-card rounded-xl text-slate-400 hover:text-white transition-colors">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Students" value={stats?.total_students} trend="4.2" icon={Users} colorClass="neon-border-blue" />
        <StatCard title="High Risk" value={stats?.at_risk_count} trend="12.8" icon={AlertTriangle} colorClass="neon-border-red" />
        <StatCard title="Pass Rate" value={`${stats?.passing_count}%`} trend="1.6" icon={CheckCircle} colorClass="neon-border-blue" />
        <StatCard title="Model Accuracy" value="94.3%" trend="0.4" icon={TrendingDown} colorClass="neon-border-blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
          <h2 className="text-lg font-bold text-white mb-6">Risk Prediction Trend</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="at_risk" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Risk Distribution</h2>
            <p className="text-slate-400 text-xs mb-8">Active student population</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="text-5xl font-black text-white mb-2">{stats?.total_students || '0'}</div>
             <div className="text-slate-500 text-xs uppercase tracking-widest">Total Students</div>
          </div>
        </div>
      </div>
    </div>
  )
}