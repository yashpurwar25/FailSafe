import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createStudent } from '../api/students'
import { ArrowLeft, Save } from 'lucide-react'

const Field = ({ label, name, type = 'text', value, onChange, options }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
    {options ? (
      <select name={name} value={value} onChange={onChange}
        className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-3 py-2.5
                   text-white text-sm focus:border-red-500 focus:outline-none">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} name={name} value={value} onChange={onChange}
        className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-3 py-2.5
                   text-white text-sm focus:border-red-500 focus:outline-none" />
    )}
  </div>
)

const YN = ['yes', 'no']

export default function AddStudent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
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
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/students" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6">Add New Student</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Identity */}
        <section className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Identity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Full Name" name="name" value={form.name} onChange={onChange} />
            <Field label="Student ID" name="student_id" value={form.student_id} onChange={onChange} />
            <Field label="Subject" name="subject" value={form.subject} onChange={onChange} options={['math', 'portuguese']} />
          </div>
        </section>

        {/* Demographics */}
        <section className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Demographics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="School" name="school" value={form.school} onChange={onChange} options={['GP','MS']} />
            <Field label="Sex" name="sex" value={form.sex} onChange={onChange} options={['M','F']} />
            <Field label="Age" name="age" type="number" value={form.age} onChange={onChange} />
            <Field label="Address" name="address" value={form.address} onChange={onChange} options={['U','R']} />
            <Field label="Family Size" name="famsize" value={form.famsize} onChange={onChange} options={['GT3','LE3']} />
            <Field label="Parents Status" name="Pstatus" value={form.Pstatus} onChange={onChange} options={['T','A']} />
            <Field label="Guardian" name="guardian" value={form.guardian} onChange={onChange} options={['mother','father','other']} />
          </div>
        </section>

        {/* Academic */}
        <section className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Academic</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="G1 (Period 1)" name="G1" type="number" value={form.G1} onChange={onChange} />
            <Field label="G2 (Period 2)" name="G2" type="number" value={form.G2} onChange={onChange} />
            <Field label="Absences" name="absences" type="number" value={form.absences} onChange={onChange} />
            <Field label="Failures" name="failures" type="number" value={form.failures} onChange={onChange} />
            <Field label="Study Time" name="studytime" type="number" value={form.studytime} onChange={onChange} />
            <Field label="Travel Time" name="traveltime" type="number" value={form.traveltime} onChange={onChange} />
            <Field label="Reason for School" name="reason" value={form.reason} onChange={onChange} options={['course','home','reputation','other']} />
          </div>
        </section>

        {/* Support & Social */}
        <section className="bg-[#111827] border border-[#1f2937] rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Support & Social</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="School Support" name="schoolsup" value={form.schoolsup} onChange={onChange} options={YN} />
            <Field label="Family Support" name="famsup" value={form.famsup} onChange={onChange} options={YN} />
            <Field label="Paid Classes" name="paid" value={form.paid} onChange={onChange} options={YN} />
            <Field label="Activities" name="activities" value={form.activities} onChange={onChange} options={YN} />
            <Field label="Higher Edu?" name="higher" value={form.higher} onChange={onChange} options={YN} />
            <Field label="Internet" name="internet" value={form.internet} onChange={onChange} options={YN} />
            <Field label="Romantic" name="romantic" value={form.romantic} onChange={onChange} options={YN} />
            <Field label="Daily Alcohol" name="Dalc" type="number" value={form.Dalc} onChange={onChange} />
            <Field label="Weekend Alcohol" name="Walc" type="number" value={form.Walc} onChange={onChange} />
            <Field label="Goout" name="goout" type="number" value={form.goout} onChange={onChange} />
            <Field label="Health" name="health" type="number" value={form.health} onChange={onChange} />
            <Field label="Family Rel." name="famrel" type="number" value={form.famrel} onChange={onChange} />
            <Field label="Medu" name="Medu" type="number" value={form.Medu} onChange={onChange} />
            <Field label="Fedu" name="Fedu" type="number" value={form.Fedu} onChange={onChange} />
          </div>
        </section>

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50
                     text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Student'}
        </button>
      </form>
    </div>
  )
}