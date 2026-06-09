import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getStudent, predictStudent, getPredictionHistory } from '../api/students'
import { ArrowLeft, Brain, AlertTriangle, Zap, Info } from 'lucide-react'
import { motion } from 'framer-motion'

const RiskGauge = ({ probability }) => {
  const pct = Math.round(probability * 100)
  const color = pct >= 75 ? '#ef4444' : pct >= 50 ? '#f97316' : pct >= 30 ? '#eab308' : '#22c55e'
  return (
    <div className="mb-8 relative">
      <div className="flex justify-between items-end mb-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">AI Risk Probability</p>
          <h3 className="text-4xl font-black text-white">{pct}%</h3>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter" 
                style={{ backgroundColor: `${color}33`, color: color, border: `1px solid ${color}44` }}>
            {pct >= 75 ? 'Critical' : pct >= 50 ? 'High' : 'Stable'}
          </span>
        </div>
      </div>
      <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          style={{ backgroundColor: color }} 
        />
      </div>
    </div>
  )
}

const ShapInsight = ({ feature, shap_value, feature_value }) => {
  const positive = shap_value > 0
  return (
    <motion.div 
      whileHover={{ x: 10 }}
      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${positive ? 'bg-red-500' : 'bg-emerald-500'}`} />
        <span className="text-gray-300 text-sm font-medium">{feature}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-500 text-xs font-mono">{feature_value}</span>
        <span className={`text-sm font-bold ${positive ? 'text-red-400' : 'text-emerald-400'}`}>
          {positive ? '+' : ''}{shap_value.toFixed(3)}
        </span>
      </div>
    </motion.div>
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

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>
  if (!student) return <div className="p-8 text-red-400">Student not found</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link to="/students" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Registry
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6">
          <div className="glass p-8 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500" />
            <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center text-4xl font-black text-white mx-auto mb-4 border border-white/20 shadow-2xl">
              {student.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-white">{student.name}</h2>
            <p className="text-gray-500 text-sm mb-6 font-mono">{student.student_id}</p>
            
            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                ['Subject', student.subject],
                ['Age', student.age],
                ['G1 Score', student.G1],
                ['G2 Score', student.G2],
                ['Absences', student.absences],
                ['Failures', student.failures],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase text-gray-500 font-bold">{k}</p>
                  <p className="text-white font-semibold">{v}</p>
                </div>
              ))}
            </div>

            <button onClick={runPrediction} disabled={predicting}
              className="mt-8 w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-600/30">
              <Brain size={20} className={predicting ? 'animate-pulse' : ''} />
              {predicting ? 'AI Analysing...' : 'Generate Risk Report'}
            </button>
          </div>
        </motion.div>

        {/* Insights Panel */}
        <div className="lg:col-span-8 space-y-6">
          {prediction ? (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-3xl border-l-4 border-l-red-500">
                <RiskGauge probability={prediction.risk_probability} />
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <Info size={20} className="text-red-400 mt-0.5" />
                  <p className="text-sm text-gray-300 leading-relaxed">{prediction.intervention_plan?.summary}</p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="glass p-6 rounded-3xl">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" /> AI Influence Factors
                  </h3>
                  <div className="space-y-2">
                    {prediction.shap_explanation?.top_factors.slice(0, 6).map(f => (
                      <ShapInsight key={f.feature} {...f} />
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="glass p-6 rounded-3xl">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-400" /> Targeted Interventions
                  </h3>
                  <div className="space-y-3">
                    {prediction.intervention_plan?.interventions.map((iv, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white text-sm font-bold">{iv.action}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded bg-white/10 ${iv.priority === 'HIGH' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {iv.priority}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">{iv.detail}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          ) : (
            <div className="glass h-full min-h-[400px] rounded-3xl flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Brain size={40} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No AI Analysis Available</h3>
              <p className="text-gray-500 max-w-xs mx-auto text-sm">Run the risk analysis to generate deep AI insights and personalised intervention plans.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}