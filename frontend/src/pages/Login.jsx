import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { ShieldAlert, Loader2, Lock, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('')
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await login(email, password)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify({ name: data.name, role: data.role }))
      navigate('/')
    } catch {
      setError('Invalid credentials. Please check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* DYNAMIC MOVING BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            x: [0, 100, 0], 
            y: [0, 50, 0] 
          }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1], 
            x: [0, -100, 0], 
            y: [0, -50, 0] 
          }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-3xl mb-4 backdrop-blur-md shadow-xl">
            <ShieldAlert className="text-red-500" size={40} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            FAIL<span className="text-red-500">SAFE</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            Secure Faculty Intelligence Portal
          </p>
        </div>

        <motion.form 
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Institutional Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="name@university.edu"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4
                             text-white placeholder-slate-600 focus:border-red-500 focus:ring-4 ring-red-500/10 outline-none transition-all text-sm" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={18} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4
                             text-white placeholder-slate-600 focus:border-red-500 focus:ring-4 ring-red-500/10 outline-none transition-all text-sm" />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="w-full group relative bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white
                         font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-red-600/30 active:scale-95 overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Authorize Access'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            </button>
          </div>
        </motion.form>
        
        <p className="text-center text-slate-500 text-[11px] mt-8 uppercase tracking-[0.2em] font-bold">
          Encrypted Session • System v1.0.4
        </p>
      </motion.div>
    </div>
  )
}