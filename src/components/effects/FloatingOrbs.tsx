import React from 'react';
import { motion } from 'framer-motion';

interface FloatingOrbsProps {
  orbCount?: number;
  className?: string;
}

export const FloatingOrbs: React.FC<FloatingOrbsProps> = ({
  orbCount = 4,
  className = "absolute inset-0 overflow-hidden pointer-events-none"
}) => {
  return (
    <div className={className}>
      {[...Array(orbCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 rounded-full"
          style={{
            background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(42, 47, 109, 0.1)' : 'rgba(249, 185, 78, 0.1)'} 0%, transparent 70%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};