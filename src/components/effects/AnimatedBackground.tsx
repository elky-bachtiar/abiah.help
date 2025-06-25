import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface AnimatedBackgroundProps {
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className = "fixed inset-0 overflow-hidden pointer-events-none"
}) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 45]);
  
  return (
    <div className={className}>
      <motion.div
        style={{ y: y1, rotate }}
        className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute -bottom-1/2 -right-1/4 w-[120%] h-[120%] bg-gradient-to-tl from-secondary/5 via-primary/5 to-transparent rounded-full blur-3xl"
      />
    </div>
  );
};