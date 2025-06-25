import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, value, label, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl flex flex-col items-center"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-secondary to-purple-500 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <motion.div 
        className="text-4xl font-bold text-white"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      >
        {value}
      </motion.div>
      <div className="text-blue-200 mt-1">{label}</div>
    </motion.div>
  );
};
