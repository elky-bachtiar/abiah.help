import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PricingCard } from './PricingCard';
import { PricingToggle } from './PricingToggle';

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  
  const toggleBillingPeriod = () => {
    setIsAnnual(!isAnnual);
  };
  
  const handleSelectPlan = (planName: string) => {
    console.log(`Selected plan: ${planName}, billing: ${isAnnual ? 'annual' : 'monthly'}`);
    // Here you would typically redirect to a signup or checkout page
    // window.location.href = `/signup?plan=${planName}&billing=${isAnnual ? 'annual' : 'monthly'}`;
  };
  
  const pricingPlans = [
    {
      title: 'Founder Essential',
      price: 199,
      annualPrice: 1908, // $159/mo when paid annually
      features: [
        '2 video consultations/month',
        'Basic document generation',
        'Email support',
        'Funding readiness score',
        'Document templates',
        'Mobile access'
      ],
      isPopular: false
    },
    {
      title: 'Growth Accelerator',
      price: 599,
      annualPrice: 5748, // $479/mo when paid annually
      features: [
        '6 video consultations/month',
        'Advanced analytics & integrations',
        'Team collaboration features',
        'Priority support',
        'Custom document templates',
        'API access'
      ],
      isPopular: true
    },
    {
      title: 'Professional Advisory',
      price: 1299,
      annualPrice: 12468, // $1039/mo when paid annually
      features: [
        'Unlimited consultations',
        'Industry-specific compliance',
        'Custom mentor avatars',
        'Dedicated success manager',
        'White-glove onboarding',
        'Advanced integrations'
      ],
      isPopular: false
    },
    {
      title: 'Enterprise Command',
      price: 3999,
      annualPrice: 38388, // $3199/mo when paid annually
      features: [
        'White-label solutions',
        'Custom integrations',
        'Dedicated success manager',
        'Enterprise SLA',
        'Custom AI training',
        'Multi-team management'
      ],
      isPopular: false
    }
  ];
  
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
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              price={plan.price}
              annualPrice={plan.annualPrice}
              features={plan.features}
              isPopular={plan.isPopular}
              isAnnual={isAnnual}
              onSelectPlan={() => handleSelectPlan(plan.title)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}