import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'

const BackgroundGradient = () => (
  <div className="mesh-gradient">
    <div className="blob"></div>
    <div className="blob blob-2"></div>
    <div className="blob blob-3"></div>
  </div>
)

export default function Layout() {
  const navigate = useNavigate()
  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  return (
    <div className="flex h-screen text-white relative overflow-hidden">
      <BackgroundGradient />
      
      {/* Floating Glass Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 m-4 rounded-2xl glass flex flex-col z-10"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg shadow-lg shadow-red-500/40">
              <ShieldAlert className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">FAILSAFE</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-medium">AI Early Warning System</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { to: '/', icon: LayoutDashboard, label: 'Analytics Hub' },
            { to: '/students', icon: Users, label: 'Student Registry' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200
                 ${isActive ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={logout}
            className="flex items-center gap-3 text-gray-400 hover:text-red-400 text-sm transition-colors w-full px-4 py-3 rounded-xl hover:bg-red-500/10">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}