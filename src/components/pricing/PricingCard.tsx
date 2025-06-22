import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button-bkp';

interface PricingCardProps {
  title: string;
  price: number;
  annualPrice?: number;
  features: string[];
  isPopular?: boolean;
  isAnnual: boolean;
  onSelectPlan: () => void;
}

export function PricingCard({ 
  title, 
  price, 
  annualPrice, 
  features, 
  isPopular = false,
  isAnnual,
  onSelectPlan
}: PricingCardProps) {
  // Calculate annual price if not provided
  const calculatedAnnualPrice = annualPrice || price * 12 * 0.8; // 20% discount
  const displayPrice = isAnnual ? calculatedAnnualPrice / 12 : price;
  const annualSavings = price * 12 - calculatedAnnualPrice;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-lg border ${
        isPopular 
          ? 'border-secondary shadow-lg relative' 
          : 'border-neutral-200 shadow-sm'
      } overflow-hidden h-full flex flex-col`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-secondary text-primary text-xs font-bold uppercase py-1 px-3 rounded-bl-lg">
          Popular
        </div>
      )}
      
      <div className="p-6 pb-0">
        <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-primary">${Math.round(displayPrice)}</span>
            <span className="text-text-secondary ml-1">/month</span>
          </div>
          
          {isAnnual && annualSavings > 0 && (
            <p className="text-success text-sm mt-1">
              Save ${Math.round(annualSavings)} annually
            </p>
          )}
        </div>
      </div>
      
      <div className="p-6 flex-grow">
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-text-secondary">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-6 pt-0 mt-auto">
        <Button
          variant={isPopular ? 'secondary' : 'outline'}
          className="w-full justify-center"
          onClick={onSelectPlan}
        >
          {isPopular ? 'Get Started' : 'Select Plan'}
        </Button>
      </div>
    </motion.div>
  );
}