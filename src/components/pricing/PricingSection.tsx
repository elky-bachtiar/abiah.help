import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PricingCard } from './PricingCard';
import { PricingToggle } from './PricingToggle';
import { products } from '../../stripe-config';

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  
  const toggleBillingPeriod = () => {
    setIsAnnual(!isAnnual);
  };
  
  // Map of product features based on product name
  const productFeatures: Record<string, string[]> = {
    'Founder Essential': [
      '4 × 30-minute video mentorship sessions per month',
      'Basic document generation',
      'Email support',
      'Funding readiness score',
      'Document templates',
      'Mobile access'
    ],
    'Growth Accelerator': [
      '8 × 45-minute video mentorship sessions per month',
      'Advanced analytics & integrations',
      'Team collaboration features',
      'Priority support',
      'Custom document templates',
      'API access'
    ],
    'Professional Advisory': [
      'Unlimited mentorship access',
      'Industry-specific compliance',
      'Custom mentor avatars',
      'Dedicated success manager',
      'White-glove onboarding',
      'Advanced integrations'
    ]
  };

  // Map of product prices
  const productPrices: Record<string, number> = {
    'Founder Essential': 199,
    'Growth Accelerator': 599,
    'Professional Advisory': 1299
  };

  // Map of annual prices (20% discount)
  const annualPrices: Record<string, number> = {
    'Founder Essential': 1908, // $159/mo when paid annually
    'Growth Accelerator': 5748, // $479/mo when paid annually
    'Professional Advisory': 12468 // $1039/mo when paid annually
  };

  // Map of popular status
  const isPopular: Record<string, boolean> = {
    'Founder Essential': false,
    'Growth Accelerator': true,
    'Professional Advisory': false
  };
  
  return (
    <section className="py-20 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Business Model & Pricing
          </h2>
          
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Subscription + Consultation Hybrid Model
          </p>
        </motion.div>
        
        <PricingToggle isAnnual={isAnnual} onToggle={toggleBillingPeriod} />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <PricingCard
              key={product.id}
              title={product.name}
              price={productPrices[product.name] || 0}
              annualPrice={annualPrices[product.name] || 0}
              features={productFeatures[product.name] || []}
              isPopular={isPopular[product.name] || false}
              isAnnual={isAnnual}
              priceId={product.priceId}
              mode={product.mode}
            />
          ))}
        </div>
      </div>
    </section>
  );
}