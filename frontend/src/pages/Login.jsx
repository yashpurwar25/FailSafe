import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { ShieldAlert, Loader2 } from 'lucide-react'
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
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-900/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-600/40">
              <ShieldAlert className="text-white" size={32} />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white">FAILSAFE</h1>
          </motion.div>
          <p className="text-gray-400 text-sm tracking-wide">Enterprise Student Risk Management</p>
        </div>

        <motion.form 
          onSubmit={handleSubmit}
          className="glass border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-xl bg-white/5"
        >
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Faculty Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="name@university.edu"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4
                         text-white placeholder-gray-600 focus:border-red-500 focus:ring-2 ring-red-500/20 outline-none transition-all text-sm" />
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4
                         text-white placeholder-gray-600 focus:border-red-500 focus:ring-2 ring-red-500/20 outline-none transition-all text-sm" />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center font-medium">
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={loading}
            className="w-full relative group overflow-hidden bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white
                       font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-red-600/30 active:scale-95">
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In to Portal'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
        </motion.form>
        
        <p className="text-center text-gray-500 text-xs mt-8 font-medium tracking-tight">
          Authorized Personnel Only. All access is logged.
        </p>
      </motion.div>
    </div>
  )
}