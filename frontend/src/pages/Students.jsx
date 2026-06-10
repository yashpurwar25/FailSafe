import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStudents, deleteStudent } from '../api/students'
import { Search, Plus, Trash2, ChevronRight } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const r = await getStudents()
      setStudents(r.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student? This cannot be undone.")) {
      try {
        await deleteStudent(id)
        setStudents(students.filter(s => s.id !== id))
      } catch (e) {
        alert("Error deleting student")
      }
    }
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.student_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Student <span className="text-red-500">Registry</span></h1>
          <p className="text-slate-400 mt-1 font-medium">Manage and monitor your student cohort.</p>
        </div>
        <Link to="/students/add"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-red-600/30 active:scale-95">
          <Plus size={18} /> Add Student
        </Link>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or ID..."
          className="w-full glass-card rounded-2xl pl-12 pr-4 py-4 text-white text-sm outline-none focus:border-red-500 transition-all" />
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-20">Loading Registry...</div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((s, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                key={s.id}
              >
                <div className="flex items-center justify-between glass-card hover:border-white/20 rounded-2xl p-4 transition-all group">
                  <Link to={`/students/${s.id}`} className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black text-lg border border-white/10">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-red-400 transition-colors">{s.name}</p>
                      <p className="text-slate-500 text-xs font-mono">{s.student_id} • {s.subject}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-4">
                    <RiskBadge level={s.predictions?.[0]?.risk_level} />
                    <button onClick={() => handleDelete(s.id)} 
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}