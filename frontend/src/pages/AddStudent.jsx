import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createStudent } from '../api/students'
import { ArrowLeft, Save, Info } from 'lucide-react'
import { motion } from 'framer-motion'

// Helper component for labels with professional tooltips
const LabelWithInfo = ({ label, info }) => (
  <div className="flex items-center gap-2 mb-1">
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="group relative">
      <Info size={12} className="text-slate-500 cursor-help hover:text-red-400 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-800 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 border border-white/10 shadow-2xl backdrop-blur-md bg-slate-800/90">
        {info}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
      </div>
    </div>
  </div>
)

const Field = ({ label, name, type = 'text', value, onChange, options, info }) => (
  <div className="flex flex-col">
    {info ? <LabelWithInfo label={label} info={info} /> : <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</label>}
    {options ? (
      <select name={name} value={value} onChange={onChange}
        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-red-500 outline-none transition-all hover:bg-slate-900/80">
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : (
      <input type={type} name={name} value={value} onChange={onChange}
        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-red-500 outline-none transition-all hover:bg-slate-900/80" />
    )}
  </div>
)

export default function AddStudent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', student_id: '', subject: 'math',
    school: 'GP', sex: 'M', age: 17,
    address: 'U', famsize: 3, Pstatus: 'T',
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
    setForm(f => ({ ...f, [name]: isNaN(value) || value === '' ? value : Number(value) }))
  }

  const onSubmit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await createStudent(form)
      navigate(`/students/${data.id}`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating student')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/students" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-all group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Registry
      </Link>
      <h1 className="text-4xl font-black text-white mb-10 tracking-tight">Add <span className="text-red-500">Student</span></h1>

      <form onSubmit={onSubmit} className="space-y-8">
        <section className="glass-card p-8 rounded-[2.5rem] border-t-4 border-t-red-600 shadow-2xl">
          <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Identity & Demographics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Full Name" name="name" value={form.name} onChange={onChange} />
            <Field label="Student ID" name="student_id" value={form.student_id} onChange={onChange} />
            <Field label="Subject" name="subject" value={form.subject} onChange={onChange} options={[{value:'math', label:'Mathematics'}, {value:'portuguese', label:'Portuguese'}]} />
            <Field label="School" name="school" value={form.school} onChange={onChange} info="Enter the school name (e.g. GP, MS, or any other)" />
            <Field label="Sex" name="sex" value={form.sex} onChange={onChange} options={[{value:'M', label:'Male'}, {value:'F', label:'Female'}]} />
            <Field label="Age" name="age" type="number" value={form.age} onChange={onChange} />
            <Field label="Family Size" name="famsize" type="number" value={form.famsize} onChange={onChange} info="Total number of people in the household." />
            <Field label="Address" name="address" value={form.address} onChange={onChange} options={[{value:'U', label:'Urban'}, {value:'R', label:'Rural'}]} info="U = Urban, R = Rural" />
            <Field label="Guardian" name="guardian" value={form.guardian} onChange={onChange} options={[{value:'mother', label:'Mother'}, {value:'father', label:'Father'}, {value:'other', label:'Other'}]} />
            <Field label="Parents Status" name="Pstatus" value={form.Pstatus} onChange={onChange} options={[{value:'T', label:'Together'}, {value:'A', label:'Apart'}]} info="T = Together, A = Apart" />
          </div>
        </section>

        <section className="glass-card p-8 rounded-[2.5rem] border-t-4 border-t-blue-600 shadow-2xl">
          <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Academic Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="G1 Score" name="G1" type="number" value={form.G1} onChange={onChange} info="Period 1 Grade (0-20)" />
            <Field label="G2 Score" name="G2" type="number" value={form.G2} onChange={onChange} info="Period 2 Grade (0-20)" />
            <Field label="Absences" name="absences" type="number" value={form.absences} onChange={onChange} />
            <Field label="Previous Failures" name="failures" type="number" value={form.failures} onChange={onChange} />
            <Field label="Study Time" name="studytime" type="number" value={form.studytime} onChange={onChange} info="1: <2h, 2: 2-5h, 3: 5-10h, 4: >10h" />
            <Field label="Travel Time" name="traveltime" type="number" value={form.traveltime} onChange={onChange} />
          </div>
        </section>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-5 rounded-3xl transition-all shadow-lg shadow-red-600/30 active:scale-95">
          <Save size={22} />
          {loading ? 'Saving to Registry...' : 'Save Student Record'}
        </button>
      </form>
    </div>
  )
}