import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo'; // IMPORTANT IMPORT

export default function Layout() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('token'); navigate('/login') };

  return (
    <div className="flex h-screen bg-[#020617] text-white relative overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 m-4 rounded-3xl glass-card flex flex-col z-10 border border-white/10"
      >
        <div className="p-6 border-b border-white/10">
          <Logo size="lg" />
          <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-medium">
            Risk Intelligence Console
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { to: '/', icon: LayoutDashboard, label: 'Analytics Hub' },
            { to: '/students', icon: Users, label: 'Student Registry' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200
                 ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
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

      <main className="flex-1 overflow-auto p-4 z-10">
        <Outlet />
      </main>
    </div>
  );
}