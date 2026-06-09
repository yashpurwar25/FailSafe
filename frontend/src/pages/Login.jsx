import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { ShieldAlert } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
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
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <ShieldAlert className="text-red-500" size={36} />
            <h1 className="text-4xl font-bold tracking-widest text-white">FAILSAFE</h1>
          </div>
          <p className="text-gray-400 text-sm">Faculty Portal · Student Risk Management</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-4 py-3
                         text-white placeholder-gray-600 focus:border-red-500 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-4 py-3
                         text-white placeholder-gray-600 focus:border-red-500 focus:outline-none text-sm" />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white
                       font-semibold py-3 rounded-lg transition-colors tracking-wide">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}