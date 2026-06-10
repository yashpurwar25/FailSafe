import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getStudent, predictStudent, getPredictionHistory } from '../api/students'

const RiskGauge = ({ probability }) => {
  const pct = Math.round(probability * 100)
  const color = pct >= 75 ? '#ef4444' : pct >= 50 ? '#f97316' : pct >= 30 ? '#eab308' : '#22c55e'
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (pct / 100) * circumference * 0.75

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
      <div style={{ position: 'relative', width: 160, height: 120 }}>
        <svg width="160" height="120" viewBox="0 0 160 120">
          <path d="M 20 110 A 60 60 0 1 1 140 110"
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 20 110 A 60 60 0 1 1 140 110"
            fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 235} 235`}
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1.5s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', bottom: 8, left: 0, right: 0,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>Risk Score</div>
        </div>
      </div>
    </div>
  )
}

const ShapBar = ({ feature, shap_value, feature_value }) => {
  const abs = Math.abs(shap_value)
  const width = Math.min(abs * 80, 100)
  const positive = shap_value > 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <span style={{ fontSize: 11, color: '#6b7280', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        title={feature}>{feature}</span>
      <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${width}%`,
          background: positive
            ? 'linear-gradient(90deg, #ef4444, #dc2626)'
            : 'linear-gradient(90deg, #22c55e, #16a34a)',
          borderRadius: 99,
          boxShadow: positive ? '0 0 6px rgba(239,68,68,0.4)' : '0 0 6px rgba(34,197,94,0.4)',
          transition: 'width 1s ease'
        }} />
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, width: 48, textAlign: 'right', flexShrink: 0,
        color: positive ? '#f87171' : '#4ade80', fontFamily: 'monospace'
      }}>
        {shap_value > 0 ? '+' : ''}{shap_value.toFixed(3)}
      </span>
      <span style={{ fontSize: 10, color: '#374151', width: 28, textAlign: 'right', flexShrink: 0, fontFamily: 'monospace' }}>
        {typeof feature_value === 'number' ? feature_value.toFixed(1) : feature_value}
      </span>
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

  if (loading) return (
    <div style={{ padding: 80, textAlign: 'center', color: '#4b5563', fontFamily: 'monospace' }}>
      Loading student record...
    </div>
  )
  if (!student) return (
    <div style={{ padding: 80, textAlign: 'center', color: '#ef4444' }}>
      Student not found.
    </div>
  )

  const riskColors = {
    CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
    HIGH: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)' },
    MODERATE: { color: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)' },
    LOW: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
  }
  const rc = riskColors[prediction?.risk_level] || riskColors.LOW

  const gradeData = [
    { period: 'G1', grade: student.G1, label: 'Period 1' },
    { period: 'G2', grade: student.G2, label: 'Period 2' },
    {
      period: 'G3*', label: 'Predicted',
      grade: prediction
        ? Math.max(0, Math.round(student.G2 + (prediction.risk_probability < 0.5
            ? 1 : -(prediction.risk_probability * 4))))
        : null
    }
  ].filter(d => d.grade !== null)

  const maxGrade = 20
  const chartH = 100

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto', fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* Back */}
      <Link to="/students" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        color: '#6b7280', textDecoration: 'none', fontSize: 13, marginBottom: 24
      }}>← Back to Students</Link>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

        {/* Left — Student Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile card */}
          <div style={{
            background: 'rgba(17,24,39,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderTop: '3px solid #ef4444',
            borderRadius: 16, padding: 24,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #ef4444, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 900, color: '#fff',
              marginBottom: 16, boxShadow: '0 4px 20px rgba(239,68,68,0.3)'
            }}>
              {student.name.charAt(0)}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{student.name}</h2>
            <p style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', marginBottom: 20 }}>{student.student_id}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Subject', student.subject],
                ['Age', student.age],
                ['G1', `${student.G1}/20`],
                ['G2', `${student.G2}/20`],
                ['Absences', student.absences],
                ['Failures', student.failures],
              ].map(([k, v]) => (
                <div key={k} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8, padding: '8px 10px'
                }}>
                  <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 14, color: '#f9fafb', fontWeight: 600, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>

            <button onClick={runPrediction} disabled={predicting} style={{
              marginTop: 20, width: '100%',
              background: predicting ? 'rgba(239,68,68,0.4)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none', borderRadius: 10, padding: '12px',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: predicting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
              fontFamily: 'inherit', letterSpacing: 1,
              transition: 'all 0.2s'
            }}>
              <span style={{ fontSize: 16 }}>{predicting ? '⟳' : '🧠'}</span>
              {predicting ? 'Analysing...' : 'Run Risk Analysis'}
            </button>
          </div>

          {/* Grade trajectory chart */}
          <div style={{
            background: 'rgba(17,24,39,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: 20,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>
              Grade Trajectory
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: chartH, paddingBottom: 20, position: 'relative' }}>
              {/* Threshold line at 10 */}
              <div style={{
                position: 'absolute', left: 0, right: 0,
                bottom: 20 + (10 / maxGrade) * (chartH - 20),
                borderTop: '1px dashed rgba(239,68,68,0.3)',
                fontSize: 9, color: '#ef4444'
              }}>
                <span style={{ position: 'absolute', right: 0, top: -14 }}>pass threshold</span>
              </div>
              {gradeData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{d.grade}</div>
                  <div style={{
                    width: '70%',
                    height: `${(d.grade / maxGrade) * (chartH - 20)}px`,
                    background: i === gradeData.length - 1 && prediction
                      ? 'linear-gradient(180deg, rgba(239,68,68,0.6), rgba(239,68,68,0.2))'
                      : d.grade >= 10
                        ? 'linear-gradient(180deg, #3b82f6, rgba(59,130,246,0.3))'
                        : 'linear-gradient(180deg, #ef4444, rgba(239,68,68,0.3))',
                    borderRadius: '4px 4px 0 0',
                    border: i === gradeData.length - 1 && prediction ? '1px dashed rgba(239,68,68,0.4)' : 'none'
                  }} />
                  <div style={{ fontSize: 10, color: '#4b5563', textAlign: 'center' }}>{d.period}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#374151', textAlign: 'center', marginTop: 4 }}>* G3 is ML-predicted</div>
          </div>
        </div>

        {/* Right — Prediction Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {prediction ? (
            <>
              {/* Risk banner */}
              <div style={{
                background: rc.bg, border: `1px solid ${rc.border}`,
                borderRadius: 16, padding: 24,
                display: 'flex', gap: 24, alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <RiskGauge probability={prediction.risk_probability} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
                    color: rc.color, marginBottom: 10
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: rc.color, display: 'inline-block', boxShadow: `0 0 8px ${rc.color}` }} />
                    {prediction.risk_level} RISK
                  </div>
                  <p style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.6, margin: 0 }}>
                    {prediction.intervention_plan?.summary}
                  </p>
                </div>
              </div>

              {/* SHAP */}
              <div style={{
                background: 'rgba(17,24,39,0.7)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 24,
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#eab308', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                    ⚡ Why This Prediction? (SHAP Explainability)
                  </div>
                  <div style={{ fontSize: 12, color: '#4b5563' }}>
                    Red bars = increases risk · Green bars = decreases risk · Value = contribution magnitude
                  </div>
                </div>
                <div>
                  {prediction.shap_explanation?.top_factors?.slice(0, 8).map((f, i) => (
                    <ShapBar key={i} {...f} />
                  ))}
                </div>
              </div>

              {/* Interventions */}
              {prediction.intervention_plan?.interventions?.length > 0 && (
                <div style={{
                  background: 'rgba(17,24,39,0.7)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16, padding: 24,
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>
                    Intervention Plan
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {prediction.intervention_plan.interventions.map((iv, i) => {
                      const pc = { HIGH: '#ef4444', MEDIUM: '#eab308', LOW: '#22c55e' }
                      return (
                        <div key={i} style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderLeft: `3px solid ${pc[iv.priority] || '#6b7280'}`,
                          borderRadius: 10, padding: '12px 16px',
                          transition: 'border-color 0.2s'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#f9fafb' }}>{iv.action}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: pc[iv.priority], letterSpacing: 1 }}>{iv.priority}</span>
                          </div>
                          <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{iv.detail}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              background: 'rgba(17,24,39,0.5)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 16, padding: '80px 40px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No Analysis Yet</h3>
              <p style={{ fontSize: 13, color: '#4b5563', maxWidth: 280, lineHeight: 1.6 }}>
                Click "Run Risk Analysis" to generate a full AI prediction with SHAP explanations and intervention plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}