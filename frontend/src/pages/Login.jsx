import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { ShieldAlert, Loader2, Lock, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'

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
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Moving Background Blobs */}
      <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><Logo size="lg" /></div>
          <motion.h1 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl font-black text-white mb-2 tracking-tight"
          >
            Welcome back
          </motion.h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Sign in to the FAILSAFE risk intelligence console.</p>
        </div>

        <motion.form onSubmit={handleSubmit} className="glass-card border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl bg-white/5">
          <div className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email address" className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-indigo-500 transition-all text-sm" />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-indigo-500 transition-all text-sm" />
            </div>
            {error && <p className="text-red-400 text-xs text-center font-medium">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign in →'}
            </button>
          </div>
          <div className="text-center mt-6">
            <p className="text-slate-500 text-sm">New to FAILSAFE? <Link to="/register" className="text-indigo-400 hover:underline font-bold">Create one</Link></p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
}