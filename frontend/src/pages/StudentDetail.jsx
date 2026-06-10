import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getStudent, predictStudent, getPredictionHistory } from '../api/students'
import { ArrowLeft, Brain, AlertTriangle, Zap, Info, TrendingUp, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart, Line, Bar } from 'recharts'

// High-End Risk Gauge Component
const RiskGauge = ({ probability }) => {
  const pct = Math.round(probability * 100)
  const color = pct >= 75 ? '#ef4444' : pct >= 50 ? '#f97316' : pct >= 30 ? '#eab308' : '#22c55e'
  
  return (
    <div className="mb-8 relative flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Semi-circle background */}
        <div className="absolute top-0 left-0 w-48 h-48 border-[20px] border-slate-800 rounded-full" />
        {/* Colored progress arc */}
        <motion.div 
          initial={{ rotate: -180 }}
          animate={{ rotate: -180 + (pct * 1.8) }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 left-0 w-48 h-48 border-[20px] rounded-full"
          style={{ borderColor: color, borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
        />
        <div className="absolute bottom-0 left-0 w-full text-center">
          <span className="text-4xl font-black text-white">{pct}%</span>
        </div>
      </div>
      <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mt-2">Failure Probability</p>
    </div>
  )
}

export default function StudentDetail() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)

  useEffect(() => {
    Promise.all([getStudent(id), getPredictionHistory(id)]).then(([sr, pr]) => {
      setStudent(sr.data)
      if (pr.data.length > 0) setPrediction(pr.data[0])
      setLoading(false)
    })
  }, [id])

  const runPrediction = async () => {
    setPredicting(true)
    try {
      const { data } = await predictStudent(id)
      setPrediction(data)
    } catch (e) { console.error(e) }
    finally { setPredicting(false) }
  }

  if (loading) return <div className="p-8 text-slate-500 text-center font-mono">Loading Intelligence Dossier...</div>
  if (!student) return <div className="p-8 text-red-400 text-center font-mono">Student record not found in database</div>

  // Data for the Grade Trajectory Chart
  const gradeData = [
    { name: 'Period 1', grade: student.G1 },
    { name: 'Period 2', grade: student.G2 },
    { name: 'Predicted', grade: prediction ? (20 - (prediction.risk_probability * 20)).toFixed(1) : null },
  ].filter(d => d.grade !== null)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link to="/students" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-all group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Registry
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] text-center relative overflow-hidden border-t-4 border-t-red-600">
            <div className="absolute top-0 right-0 p-4">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center text-4xl font-black text-white mx-auto mb-4 border border-white/20 shadow-2xl">
              {student.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-white">{student.name}</h2>
            <p className="text-slate-500 text-sm mb-6 font-mono">{student.student_id}</p>
            <div className="grid grid-cols-2 gap-3 text-left">
              {[ ['Subject', student.subject], ['Age', student.age], ['G1', student.G1], ['G2', student.G2], ['Absences', student.absences], ['Failures', student.failures] ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase text-slate-500 font-bold">{k}</p>
                  <p className="text-white font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <button onClick={runPrediction} disabled={predicting}
              className="mt-8 w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-600/30 active:scale-95">
              <Brain size={20} className={predicting ? 'animate-pulse' : ''} />
              {predicting ? 'AI Analysing...' : 'Run Risk Analysis'}
            </button>
          </div>
        </motion.div>

        {/* Insights Panel */}
        <div className="lg:col-span-8 space-y-6">
          {prediction ? (
            <>
              {/* Top Row: Gauge and Trajectory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-[2.5rem] flex flex-col items-center justify-center">
                  <RiskGauge probability={prediction.risk_probability} />
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 w-full">
                    <Info size={20} className="text-red-400 mt-0.5" />
                    <p className="text-sm text-slate-300 leading-relaxed">{prediction.intervention_plan?.summary}</p>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-[2.5rem]">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={20} className="text-blue-400" />
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest">Grade Trajectory</h3>
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={gradeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 20]} stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                        <Area type="monotone" dataKey="grade" stroke="#3b82f6" strokeWidth={4} fill="url(#colorGrade)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-slate-500 text-[11px] text-center mt-4 italic">Predicted G3 based on current momentum</p>
                </motion.div>
              </div>

              {/* Bottom Row: SHAP and Interventions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-3xl">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" /> AI Feature Impact
                  </h3>
                  <div className="space-y-3">
                    {prediction.shap_explanation?.top_factors.slice(0, 6).map((f, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <span className="text-slate-400 text-xs w-32 truncate">{f.feature}</span>
                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${Math.min(Math.abs(f.shap_value) * 100, 100)}%` }}
                            className={`h-full rounded-full ${f.shap_value > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                          />
                        </div>
                        <span className={`text-xs font-bold w-12 text-right ${f.shap_value > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {f.shap_value > 0 ? '+' : ''}{f.shap_value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-3xl">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Personalized Plan</h3>
                  <div className="space-y-3">
                    {prediction.intervention_plan?.interventions.map((iv, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white text-sm font-bold group-hover:text-red-400 transition-colors">{iv.action}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded bg-white/10 ${iv.priority === 'HIGH' ? 'text-red-400' : 'text-yellow-400'}`}>{iv.priority}</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">{iv.detail}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          ) : (
            <div className="glass-card h-full min-h-[500px] rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Brain size={40} className="text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Awaiting AI Analysis</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">Initialize the risk engine to generate a detailed diagnostic report for this student.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}