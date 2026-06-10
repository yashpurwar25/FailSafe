import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function Logo({ size = "lg" }) {
  return (
    <motion.div 
      className="flex items-center gap-3 cursor-pointer"
      // This makes the logo float up and down smoothly
      animate={{ 
        y: [0, -8, 0],
        scale: [1, 1.02, 1]
      }} 
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      whileHover={{ scale: 1.1 }}
    >
      <div className={`relative ${size === 'lg' ? 'p-2' : 'p-1'} bg-red-600 rounded-xl shadow-lg shadow-red-600/40`}>
        <ShieldAlert className="text-white" size={size === 'lg' ? 24 : 16} />
        {/* This adds a glowing pulse effect behind the icon */}
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-white/30 rounded-xl blur-sm" 
        />
      </div>
      <span className={`font-black tracking-tighter text-white ${size === 'lg' ? 'text-2xl' : 'text-sm'}`}>
        FAIL<span className="text-red-500">SAFE</span>
      </span>
    </motion.div>
  );
}