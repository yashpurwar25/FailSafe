import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function Logo({ size = "lg" }) {
  return (
    <motion.div 
      className="flex items-center gap-3 cursor-pointer"
      animate={{ 
        y: [0, -6, 0],
        scale: [1, 1.02, 1]
      }} 
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <div className={`relative ${size === 'lg' ? 'p-2' : 'p-1'} bg-red-600 rounded-xl shadow-lg shadow-red-600/40`}>
        <ShieldAlert className="text-white" size={size === 'lg' ? 24 : 16} />
        {/* The "Heartbeat" glow effect */}
        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-red-400 rounded-xl blur-md -z-10" 
        />
      </div>
      <span className={`font-black tracking-tighter text-white ${size === 'lg' ? 'text-2xl' : 'text-sm'}`}>
        FAIL<span className="text-red-500">SAFE</span>
      </span>
    </motion.div>
  );
}
