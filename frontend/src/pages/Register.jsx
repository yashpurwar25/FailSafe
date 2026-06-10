import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'
import { ShieldAlert, Loader2, User, Mail, Lock, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', role: 'faculty'
  })
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await register(formData)
      // Success! Redirect to login
      navigate('/login')
    } catch {
      setError('Registration failed. Email might already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* DYNAMIC MOVING BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -100, 0], y: [0, -50, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-3xl mb-4 backdrop-blur-md shadow-xl">
            <ShieldAlert className="text-red-500" size={40} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            JOIN <span className="text-red-500">FAILSAFE</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Create your faculty account</p>
        </div>

        <motion.form 
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-500 transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Department</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-500 transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Institutional Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-500 transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-red-500 transition-all text-sm" />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center mt-4 font-medium">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full mt-8 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-600/30 active:scale-95 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>

          <div className="text-center mt-6">
            <p className="text-slate-500 text-sm">Already have an account? <Link to="/login" className="text-red-500 hover:underline font-bold">Sign In</Link></p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
}