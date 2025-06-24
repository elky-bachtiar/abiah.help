import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { createCheckoutSession } from '../../api/stripe';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '../../store/auth';
import { useNavigate } from 'react-router-dom';

interface PricingCardProps {
  title: string;
  price: number;
  annualPrice?: number;
  features: string[];
  isPopular?: boolean;
  isAnnual: boolean;
  priceId: string;
  mode: 'subscription' | 'payment';
  badge?: string;
  subtitle?: string;
  hasTrial?: boolean;
}

export function PricingCard({ 
  title, 
  price, 
  annualPrice, 
  features, 
  isPopular = false,
  isAnnual,
  priceId,
  mode,
  badge,
  subtitle,
  hasTrial = false
}: PricingCardProps) {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  // Calculate annual price if not provided
  const calculatedAnnualPrice = annualPrice || price * 12 * 0.8; // 20% discount
  const displayPrice = isAnnual ? calculatedAnnualPrice / 12 : price;
  const annualSavings = price * 12 - calculatedAnnualPrice;
  
  const handleSelectPlan = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=pricing');
      return;
    }

    try {
      setIsLoading(true);
      // Add trial period for subscription mode
      const { url } = await createCheckoutSession(priceId, mode, hasTrial ? 5 : undefined);
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      {badge && (
        <div className="bg-primary/10 text-primary text-xs font-medium py-2 px-4 text-center">
          {badge}
        </div>
      )}
      
      <div className="p-6 pb-0">
        <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
        
        {subtitle && (
          <p className="text-sm text-text-secondary mb-3">{subtitle}</p>
        )}
        
        <div className="mb-4">
                hasTrial ? `Start 5-Day Free Trial` : (isPopular ? 'Get Started' : 'Select Plan')
            <span className="text-4xl font-bold text-primary">${displayPrice}</span>
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
          onClick={handleSelectPlan}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            isPopular ? 'Get Started' : 'Select Plan'
          )}
        </Button>
      </div>
    </motion.div>
  );
}