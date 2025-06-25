import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
  delay: number;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, company, quote, avatar, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-xl shadow-xl p-6"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-bold text-primary">{name}</div>
          <div className="text-sm text-text-secondary">{role}, {company}</div>
        </div>
      </div>
      <div className="text-text-primary italic">{quote}</div>
      <div className="mt-4 flex">
        {[1, 2, 3, 4, 5].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400" fill="#FACC15" />
        ))}
      </div>
    </motion.div>
  );
};
