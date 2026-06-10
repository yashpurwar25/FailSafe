import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getStudent, predictStudent, getPredictionHistory } from '../api/students'
import { ArrowLeft, Brain, AlertTriangle, Zap, Info } from 'lucide-react'
import { motion } from 'framer-motion'

const RiskGauge = ({ probability }) => {
  const pct = Math.round(probability * 100)
  const color = pct >= 75 ? '#ef4444' : pct >= 50 ? '#f97316' : pct >= 30 ? '#eab308' : '#22c55e'
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-3">
        <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">AI Risk Probability</span>
        <span className="text-white font-black text-2xl">{pct}%</span>
      </div>
      <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
        <motion.div 
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5 }}
          className="h-full rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          style={{ backgroundColor: color }} 
        />
      </div>
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

  if (loading) return <div className="p-8 text-slate-500 text-center">Loading Student Dossier...</div>
  if (!student) return <div className="p-8 text-red-400 text-center">Student not found</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link to="/students" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-all group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Registry
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] text-center relative overflow-hidden border-t-4 border-t-red-600">
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
              {predicting ? 'Analysing...' : 'Run Risk Analysis'}
            </button>
          </div>
        </motion.div>

        <div className="lg:col-span-8 space-y-6">
          {prediction ? (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-[2.5rem] border-l-4 border-l-red-500">
                <RiskGauge probability={prediction.risk_probability} />
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <Info size={20} className="text-red-400 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">{prediction.intervention_plan?.summary}</p>
                </div>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-3xl">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" /> AI Influence Factors
                  </h3>
                  <div className="space-y-2">
                    {prediction.shap_explanation?.top_factors.slice(0, 6).map(f => (
                      <div key={f.feature} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <span className="text-slate-300 text-xs font-medium">{f.feature}</span>
                        <span className={`text-xs font-bold ${f.shap_value > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {f.shap_value > 0 ? '+' : ''}{f.shap_value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-6 rounded-3xl">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Interventions</h3>
                  <div className="space-y-3">
                    {prediction.intervention_plan?.interventions.map((iv, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white text-sm font-bold">{iv.action}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/10 text-slate-400">{iv.priority}</span>
                        </div>
                        <p className="text-slate-400 text-xs">{iv.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card h-full min-h-[400px] rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
              <Brain size={48} className="text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Analysis Available</h3>
              <p className="text-slate-500 text-sm max-w-xs">Run the risk analysis to generate deep AI insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}