import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { Loader2, Lock, Mail, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'

export default function Login() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await login(email, password)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify({ name: data.name, role: data.role }))
      navigate('/')
    } catch {
      alert("Invalid credentials")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-[2.5rem] p-10 text-center relative"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-600/20 rounded-full border border-indigo-500/30">
            <ShieldAlert className="text-indigo-400" size={32} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-slate-400 text-sm mb-10">Sign in to the FAILSAFE risk intelligence console.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="Email address"
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-indigo-500 transition-all text-sm" />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="Password"
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-indigo-500 transition-all text-sm" />
          </div>

          <div className="text-right text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors mb-6">
            Forgot password?
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign in →'}
          </button>
        </form>

        <p className="text-slate-500 text-sm mt-8">
          New to FAILSAFE? <Link to="/register" className="text-indigo-400 hover:underline font-bold">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}