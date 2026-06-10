import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createStudent } from '../api/students'

const VALID_SCHOOLS = ['GP', 'MS']

const InfoTooltip = ({ text }) => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
    <span style={{
      width: 16, height: 16, borderRadius: '50%',
      background: 'rgba(107,114,128,0.3)', color: '#9ca3af',
      fontSize: 10, display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center', cursor: 'help', fontWeight: 700
    }}
      title={text}
    >?</span>
  </div>
)

const Field = ({ label, name, type = 'text', value, onChange, options, info, error, placeholder, min, max, readOnly, hint }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, color: '#9ca3af',
        letterSpacing: 2, textTransform: 'uppercase'
      }}>{label}</label>
      {info && <InfoTooltip text={info} />}
    </div>
    {hint && (
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: -2 }}>{hint}</div>
    )}
    {options ? (
      <select name={name} value={value} onChange={onChange} disabled={readOnly}
        style={{
          background: readOnly ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.3)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(75,85,99,0.4)'}`,
          borderRadius: 10, padding: '11px 14px',
          color: readOnly ? '#6b7280' : '#fff', fontSize: 13,
          outline: 'none', fontFamily: 'inherit',
          cursor: readOnly ? 'not-allowed' : 'pointer',
          width: '100%'
        }}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: '#111827' }}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type} name={name} value={value}
        onChange={onChange} placeholder={placeholder}
        min={min} max={max} readOnly={readOnly}
        style={{
          background: readOnly ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.3)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(75,85,99,0.4)'}`,
          borderRadius: 10, padding: '11px 14px',
          color: readOnly ? '#6b7280' : '#fff', fontSize: 13,
          outline: 'none', fontFamily: 'inherit',
          cursor: readOnly ? 'not-allowed' : 'text',
          width: '100%', boxSizing: 'border-box'
        }}
        onFocus={e => { if (!readOnly) e.target.style.borderColor = 'rgba(239,68,68,0.5)' }}
        onBlur={e => { if (!readOnly) e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(75,85,99,0.4)' }}
      />
    )}
    {error && (
      <div style={{
        fontSize: 11, color: '#f87171',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 6, padding: '6px 10px'
      }}>{error}</div>
    )}
  </div>
)

const Section = ({ title, color, children }) => (
  <div style={{
    background: 'rgba(17,24,39,0.6)',
    border: `1px solid rgba(255,255,255,0.06)`,
    borderTop: `3px solid ${color}`,
    borderRadius: 16, padding: 28,
    backdropFilter: 'blur(10px)'
  }}>
    <h2 style={{
      fontSize: 11, fontWeight: 700, color: color,
      letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20
    }}>{title}</h2>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 16
    }}>
      {children}
    </div>
  </div>
)

// Map any school name to GP or MS intelligently
const normalizeSchool = (input) => {
  const val = input.trim().toUpperCase()
  if (val === 'GP' || val.includes('GABRIEL') || val.includes('PEREIRA')) return 'GP'
  if (val === 'MS' || val.includes('MOUSINHO') || val.includes('SILVEIRA')) return 'MS'
  // Hash-based fallback — consistent mapping for unknown schools
  const hash = input.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return hash % 2 === 0 ? 'GP' : 'MS'
}

const YN = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]

export default function AddStudent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [schoolInput, setSchoolInput] = useState('')
  const [schoolError, setSchoolError] = useState('')
  const [schoolWarning, setSchoolWarning] = useState('')
  const [famsizeInput, setFamsizeInput] = useState(4)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    name: '', student_id: '', subject: 'math',
    school: 'GP', sex: 'M', age: 17,
    address: 'U', famsize: 'GT3', Pstatus: 'T',
    Medu: 2, Fedu: 2, Mjob: 'other', Fjob: 'other',
    reason: 'course', guardian: 'mother',
    traveltime: 1, studytime: 2, failures: 0,
    schoolsup: 'no', famsup: 'yes', paid: 'no',
    activities: 'no', nursery: 'yes', higher: 'yes',
    internet: 'yes', romantic: 'no',
    famrel: 4, freetime: 3, goout: 3,
    Dalc: 1, Walc: 1, health: 3,
    absences: 0, G1: 10, G2: 10
  })

  const onChange = e => {
    const { name, value } = e.target
    setForm(f => ({
      ...f,
      [name]: (type => type === 'number' || (!isNaN(value) && value !== '') ? Number(value) : value)(e.target.type)
    }))
  }

  const handleSchoolInput = e => {
    const val = e.target.value
    setSchoolInput(val)
    setSchoolError('')
    setSchoolWarning('')

    if (!val.trim()) {
      setSchoolError('School name is required.')
      return
    }

    const upper = val.trim().toUpperCase()
    if (VALID_SCHOOLS.includes(upper)) {
      setForm(f => ({ ...f, school: upper }))
      setSchoolWarning('')
    } else {
      const mapped = normalizeSchool(val)
      setForm(f => ({ ...f, school: mapped }))
      setSchoolWarning(
        `"${val}" is not a recognised school. The model was trained on GP (Gabriel Pereira) and MS (Mousinho da Silveira) only. Your input has been mapped to "${mapped}" for prediction. Valid values: GP, MS.`
      )
    }
  }

  const handleFamsize = e => {
    const num = parseInt(e.target.value) || 0
    setFamsizeInput(num)
    setForm(f => ({ ...f, famsize: num > 3 ? 'GT3' : 'LE3' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Student name is required.'
    if (!form.student_id.trim()) e.student_id = 'Student ID is required.'
    if (!schoolInput.trim()) e.school = 'School name is required.'
    if (form.G1 < 0 || form.G1 > 20) e.G1 = 'G1 must be between 0 and 20.'
    if (form.G2 < 0 || form.G2 > 20) e.G2 = 'G2 must be between 0 and 20.'
    if (form.age < 10 || form.age > 25) e.age = 'Age must be between 10 and 25.'
    if (form.absences < 0) e.absences = 'Absences cannot be negative.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await createStudent(form)
      navigate(`/students/${data.id}`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating student')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      padding: '32px', maxWidth: 1000, margin: '0 auto',
      fontFamily: '"Inter", system-ui, sans-serif'
    }}>
      {/* Back */}
      <Link to="/students" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        color: '#6b7280', textDecoration: 'none', fontSize: 13,
        marginBottom: 24, transition: 'color 0.2s'
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
      >
        ← Back to Students
      </Link>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#ef4444', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
          ● NEW RECORD
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>Add Student</h1>
        <p style={{ color: '#4b5563', fontSize: 13, marginTop: 6 }}>
          All fields marked with * are required. G3 (final grade) is predicted by the ML model — do not enter it manually.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Identity */}
        <Section title="① Identity & Demographics" color="#ef4444">
          <Field label="Full Name *" name="name" value={form.name} onChange={onChange}
            placeholder="e.g. Arjun Sharma" error={errors.name} />
          <Field label="Student ID *" name="student_id" value={form.student_id} onChange={onChange}
            placeholder="e.g. STU001" error={errors.student_id} />
          <Field label="Subject" name="subject" value={form.subject} onChange={onChange}
            options={[{ value: 'math', label: 'Mathematics' }, { value: 'portuguese', label: 'Portuguese' }]} />
          <Field label="Sex" name="sex" value={form.sex} onChange={onChange}
            options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }]} />
          <Field label="Age *" name="age" type="number" value={form.age} onChange={onChange}
            min={10} max={25} error={errors.age} />

          {/* School — text input with smart validation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase' }}>
              School Name *
            </label>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              Model trained on: <span style={{ color: '#f97316' }}>GP</span> (Gabriel Pereira) and <span style={{ color: '#f97316' }}>MS</span> (Mousinho da Silveira)
            </div>
            <input
              value={schoolInput} onChange={handleSchoolInput}
              placeholder="Type school name or code (e.g. GP, MS)"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${schoolError ? 'rgba(239,68,68,0.5)' : schoolWarning ? 'rgba(249,115,22,0.4)' : 'rgba(75,85,99,0.4)'}`,
                borderRadius: 10, padding: '11px 14px',
                color: '#fff', fontSize: 13, outline: 'none',
                fontFamily: 'inherit', width: '100%', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.5)'}
              onBlur={e => e.target.style.borderColor = schoolError ? 'rgba(239,68,68,0.5)' : schoolWarning ? 'rgba(249,115,22,0.4)' : 'rgba(75,85,99,0.4)'}
            />
            {schoolError && (
              <div style={{ fontSize: 11, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '6px 10px' }}>
                ✕ {schoolError}
              </div>
            )}
            {schoolWarning && (
              <div style={{ fontSize: 11, color: '#fb923c', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 6, padding: '8px 10px', lineHeight: 1.5 }}>
                ⚠ {schoolWarning}
              </div>
            )}
            {schoolInput && !schoolError && !schoolWarning && (
              <div style={{ fontSize: 11, color: '#4ade80', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, padding: '6px 10px' }}>
                ✓ Mapped to: <strong>{form.school}</strong>
              </div>
            )}
          </div>

          {/* Family size — number input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase' }}>
              Family Size
            </label>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              Number of people in household. ≤3 = small family, &gt;3 = large family
            </div>
            <input
              type="number" value={famsizeInput} onChange={handleFamsize}
              min={1} max={20} placeholder="e.g. 4"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(75,85,99,0.4)',
                borderRadius: 10, padding: '11px 14px',
                color: '#fff', fontSize: 13, outline: 'none',
                fontFamily: 'inherit', width: '100%', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(75,85,99,0.4)'}
            />
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              Will be stored as: <span style={{ color: famsizeInput > 3 ? '#f97316' : '#22c55e', fontWeight: 600 }}>
                {famsizeInput > 3 ? 'GT3 (Greater than 3)' : 'LE3 (3 or fewer)'}
              </span>
            </div>
          </div>

          <Field label="Address Type" name="address" value={form.address} onChange={onChange}
            options={[
              { value: 'U', label: 'Urban (U) — City or town area' },
              { value: 'R', label: 'Rural (R) — Countryside or village' }
            ]}
            info="U = Urban (city/town), R = Rural (village/countryside)" />

          <Field label="Parent Status" name="Pstatus" value={form.Pstatus} onChange={onChange}
            options={[
              { value: 'T', label: 'T — Living Together' },
              { value: 'A', label: 'A — Living Apart' }
            ]}
            info="T = Parents live together, A = Parents live apart (separated/divorced)" />

          <Field label="Guardian" name="guardian" value={form.guardian} onChange={onChange}
            options={[{ value: 'mother', label: 'Mother' }, { value: 'father', label: 'Father' }, { value: 'other', label: 'Other' }]} />
        </Section>

        {/* Academic */}
        <Section title="② Academic Performance" color="#3b82f6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase' }}>G1 Score *</label>
              <InfoTooltip text="Period 1 Grade — first term exam result (0 to 20)" />
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>First term grade (0–20). 10 = passing threshold.</div>
            <input type="number" name="G1" value={form.G1} onChange={onChange} min={0} max={20}
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.G1 ? 'rgba(239,68,68,0.5)' : 'rgba(75,85,99,0.4)'}`, borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
              onBlur={e => e.target.style.borderColor = errors.G1 ? 'rgba(239,68,68,0.5)' : 'rgba(75,85,99,0.4)'}
            />
            {errors.G1 && <div style={{ fontSize: 11, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '6px 10px' }}>{errors.G1}</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase' }}>G2 Score *</label>
              <InfoTooltip text="Period 2 Grade — second term exam result (0 to 20)" />
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Second term grade (0–20). Used with G1 to predict final risk.</div>
            <input type="number" name="G2" value={form.G2} onChange={onChange} min={0} max={20}
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.G2 ? 'rgba(239,68,68,0.5)' : 'rgba(75,85,99,0.4)'}`, borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
              onBlur={e => e.target.style.borderColor = errors.G2 ? 'rgba(239,68,68,0.5)' : 'rgba(75,85,99,0.4)'}
            />
            {errors.G2 && <div style={{ fontSize: 11, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '6px 10px' }}>{errors.G2}</div>}
          </div>

          {/* G3 — read only */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase' }}>G3 — Final Grade</label>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              Final exam grade. <span style={{ color: '#ef4444', fontWeight: 600 }}>This is what the AI predicts.</span> Do not enter manually.
            </div>
            <div style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 10, padding: '11px 14px',
              color: '#6b7280', fontSize: 13, fontStyle: 'italic'
            }}>
              🤖 Auto-predicted by FAILSAFE ML model after saving
            </div>
          </div>

          <Field label="Absences" name="absences" type="number" value={form.absences}
            onChange={onChange} min={0} error={errors.absences}
            info="Total number of school absences this year" />
          <Field label="Previous Failures" name="failures" type="number" value={form.failures}
            onChange={onChange} min={0} max={4}
            info="Number of past class failures (0–4)" />
          <Field label="Study Time (per week)" name="studytime" value={form.studytime} onChange={onChange}
            options={[
              { value: 1, label: '1 — Less than 2 hours' },
              { value: 2, label: '2 — 2 to 5 hours' },
              { value: 3, label: '3 — 5 to 10 hours' },
              { value: 4, label: '4 — More than 10 hours' }
            ]}
            info="Weekly study time outside school" />
          <Field label="Travel Time to School" name="traveltime" value={form.traveltime} onChange={onChange}
            options={[
              { value: 1, label: '1 — Less than 15 minutes' },
              { value: 2, label: '2 — 15 to 30 minutes' },
              { value: 3, label: '3 — 30 min to 1 hour' },
              { value: 4, label: '4 — More than 1 hour' }
            ]} />
          <Field label="Reason for Choosing School" name="reason" value={form.reason} onChange={onChange}
            options={[
              { value: 'course', label: 'Course preference' },
              { value: 'home', label: 'Close to home' },
              { value: 'reputation', label: 'School reputation' },
              { value: 'other', label: 'Other reason' }
            ]} />
        </Section>

        {/* Parent Info */}
        <Section title="③ Parent & Family Info" color="#8b5cf6">
          <Field label="Mother's Education" name="Medu" value={form.Medu} onChange={onChange}
            options={[
              { value: 0, label: '0 — No education' },
              { value: 1, label: '1 — Primary (4th grade)' },
              { value: 2, label: '2 — 5th to 9th grade' },
              { value: 3, label: '3 — Secondary education' },
              { value: 4, label: '4 — Higher education' }
            ]} />
          <Field label="Father's Education" name="Fedu" value={form.Fedu} onChange={onChange}
            options={[
              { value: 0, label: '0 — No education' },
              { value: 1, label: '1 — Primary (4th grade)' },
              { value: 2, label: '2 — 5th to 9th grade' },
              { value: 3, label: '3 — Secondary education' },
              { value: 4, label: '4 — Higher education' }
            ]} />
          <Field label="Mother's Job" name="Mjob" value={form.Mjob} onChange={onChange}
            options={[
              { value: 'teacher', label: 'Teacher' },
              { value: 'health', label: 'Healthcare' },
              { value: 'services', label: 'Civil Services' },
              { value: 'at_home', label: 'At Home' },
              { value: 'other', label: 'Other' }
            ]} />
          <Field label="Father's Job" name="Fjob" value={form.Fjob} onChange={onChange}
            options={[
              { value: 'teacher', label: 'Teacher' },
              { value: 'health', label: 'Healthcare' },
              { value: 'services', label: 'Civil Services' },
              { value: 'at_home', label: 'At Home' },
              { value: 'other', label: 'Other' }
            ]} />
          <Field label="Family Relationship Quality" name="famrel" value={form.famrel} onChange={onChange}
            options={[
              { value: 1, label: '1 — Very bad' }, { value: 2, label: '2 — Bad' },
              { value: 3, label: '3 — Neutral' }, { value: 4, label: '4 — Good' },
              { value: 5, label: '5 — Excellent' }
            ]}
            info="Quality of family relationships (1=very bad, 5=excellent)" />
        </Section>

        {/* Support & Social */}
        <Section title="④ Support & Social Life" color="#22c55e">
          <Field label="School Extra Support" name="schoolsup" value={form.schoolsup} onChange={onChange} options={YN}
            info="Does the student receive extra educational support from school?" />
          <Field label="Family Educational Support" name="famsup" value={form.famsup} onChange={onChange} options={YN}
            info="Does the family provide extra educational support at home?" />
          <Field label="Paid Extra Classes" name="paid" value={form.paid} onChange={onChange} options={YN}
            info="Does the student attend paid tutoring classes outside school?" />
          <Field label="Extracurricular Activities" name="activities" value={form.activities} onChange={onChange} options={YN} />
          <Field label="Attended Nursery School" name="nursery" value={form.nursery} onChange={onChange} options={YN} />
          <Field label="Wants Higher Education" name="higher" value={form.higher} onChange={onChange} options={YN}
            info="Does the student want to pursue higher education after school?" />
          <Field label="Has Internet at Home" name="internet" value={form.internet} onChange={onChange} options={YN} />
          <Field label="In a Romantic Relationship" name="romantic" value={form.romantic} onChange={onChange} options={YN} />
          <Field label="Free Time After School" name="freetime" value={form.freetime} onChange={onChange}
            options={[
              { value: 1, label: '1 — Very little' }, { value: 2, label: '2 — Little' },
              { value: 3, label: '3 — Moderate' }, { value: 4, label: '4 — High' },
              { value: 5, label: '5 — Very high' }
            ]} />
          <Field label="Goes Out with Friends" name="goout" value={form.goout} onChange={onChange}
            options={[
              { value: 1, label: '1 — Rarely' }, { value: 2, label: '2 — Sometimes' },
              { value: 3, label: '3 — Often' }, { value: 4, label: '4 — Frequently' },
              { value: 5, label: '5 — Very frequently' }
            ]} />
          <Field label="Health Status" name="health" value={form.health} onChange={onChange}
            options={[
              { value: 1, label: '1 — Very bad' }, { value: 2, label: '2 — Bad' },
              { value: 3, label: '3 — Average' }, { value: 4, label: '4 — Good' },
              { value: 5, label: '5 — Excellent' }
            ]} />
        </Section>

        {/* Alcohol */}
        <Section title="⑤ Lifestyle Indicators" color="#f97316">
          <Field label="Workday Alcohol Use" name="Dalc" value={form.Dalc} onChange={onChange}
            options={[
              { value: 1, label: '1 — Very low' }, { value: 2, label: '2 — Low' },
              { value: 3, label: '3 — Moderate' }, { value: 4, label: '4 — High' },
              { value: 5, label: '5 — Very high' }
            ]}
            info="Alcohol consumption during school days (1=very low, 5=very high)" />
          <Field label="Weekend Alcohol Use" name="Walc" value={form.Walc} onChange={onChange}
            options={[
              { value: 1, label: '1 — Very low' }, { value: 2, label: '2 — Low' },
              { value: 3, label: '3 — Moderate' }, { value: 4, label: '4 — High' },
              { value: 5, label: '5 — Very high' }
            ]}
            info="Alcohol consumption on weekends (1=very low, 5=very high)" />
        </Section>

        {/* Submit */}
        <button type="submit" disabled={loading} style={{
          width: '100%',
          background: loading ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
          border: 'none', borderRadius: 12,
          padding: '16px', color: '#fff',
          fontSize: 15, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 20px rgba(239,68,68,0.3)',
          fontFamily: 'inherit', transition: 'all 0.2s'
        }}>
          {loading ? '⟳ Saving to Registry...' : '✓ Save Student Record'}
        </button>
      </form>
      <style>{`input::placeholder { color: #374151; } select option { background: #111827; color: #fff; }`}</style>
    </div>
  )
}