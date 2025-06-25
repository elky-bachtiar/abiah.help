import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const ScrollIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        repeat: Infinity, 
        repeatType: "reverse" 
      }}
      className="flex flex-col items-center"
    >
      <div className="text-white/70 text-sm mb-2">Scroll to explore</div>
      <ChevronDown className="w-6 h-6 text-white/70" />
    </motion.div>
  );
};
