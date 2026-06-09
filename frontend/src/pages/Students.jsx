import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStudents } from '../api/students'
import { Search, Plus, Filter, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const RiskBadge = ({ level }) => {
  const styles = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    MODERATE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }
  return level ? (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles[level] || ''}`}>{level}</span>
  ) : <span className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded-full">Not Assessed</span>
}

export default function Students() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudents().then(r => { setStudents(r.data); setLoading(false) })
  }, [])

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.student_id?.toLowerCase().includes(search.toLowerCase());
    const risk = s.predictions?.[0]?.risk_level;
    const matchesFilter = filter === 'ALL' || risk === filter;
    return matchesSearch && matchesFilter;
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Student <span className="text-red-500">Registry</span></h1>
          <p className="text-gray-400 mt-1">Manage and monitor your student cohort.</p>
        </div>
        <Link to="/students/add"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-red-600/30">
          <Plus size={18} /> Add Student
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full glass rounded-2xl pl-12 pr-4 py-3 text-white text-sm focus:ring-2 ring-red-500/50 outline-none transition-all" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(lvl => (
            <button key={lvl} onClick={() => setFilter(lvl)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filter === lvl ? 'bg-red-500 border-red-500 text-white' : 'glass border-white/10 text-gray-400 hover:text-white'}`}>
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">Loading Registry...</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence>
            {filtered.map((s, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                key={s.id}
              >
                <Link to={`/students/${s.id}`}
                  className="flex items-center justify-between glass hover:border-white/30 rounded-2xl p-4 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black text-lg border border-white/10">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-red-400 transition-colors">{s.name}</p>
                      <p className="text-gray-500 text-xs font-mono">{s.student_id} • {s.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <RiskBadge level={s.predictions?.[0]?.risk_level} />
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-600 group-hover:text-white group-hover:bg-red-500 transition-all">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-20 glass rounded-3xl text-gray-500">No students match your current filters.</div>
          )}
        </div>
      )}
    </div>
  )
}