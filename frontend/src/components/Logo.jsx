import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function Logo({ size = "lg" }) {
  return (
    <motion.div 
      className="flex items-center gap-3 cursor-pointer"
      animate={{ y: [0, -5, 0] }} 
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className={`relative ${size === 'lg' ? 'p-2' : 'p-1'} bg-red-600 rounded-xl shadow-lg shadow-red-600/40`}>
        <ShieldAlert className="text-white" size={size === 'lg' ? 24 : 16} />
        <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
      </div>
      <span className={`font-black tracking-tighter text-white ${size === 'lg' ? 'text-2xl' : 'text-sm'}`}>
        FAIL<span className="text-red-500">SAFE</span>
      </span>
    </motion.div>
  );
}