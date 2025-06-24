import React from 'react';
import { motion } from 'framer-motion';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: () => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
      <span className={`text-sm font-medium ${!isAnnual ? 'text-primary' : 'text-text-secondary'}`}>
        Monthly Billing
      </span>
      
      <button
        onClick={onToggle}
        className="relative inline-flex h-6 w-12 items-center rounded-full bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        role="switch"
        aria-checked={isAnnual}
      >
        <span className="sr-only">Toggle billing period</span>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
          style={{ x: isAnnual ? 24 : 4 }}
        />
        <span 
          className={`absolute inset-0 rounded-full ${isAnnual ? 'bg-primary' : 'bg-neutral-200'} transition-colors`}
        />
      </button>
      
      <span className={`text-sm font-medium ${isAnnual ? 'text-primary' : 'text-text-secondary'}`}>
        Annual Billing
        <span className="ml-1.5 inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
          Save 20% 🎉
        </span>
      </span>
      
      {/* Added explanation text */}
      <div className="w-full text-center mt-2 text-xs text-text-secondary">
        All plans include a 5-day free trial. No credit card required to start.
      </div>
    </div>
  );
}