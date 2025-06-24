import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PricingCard } from './PricingCard';
import { PricingToggle } from './PricingToggle';
import { products } from 'src/stripe-config';

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  
  const toggleBillingPeriod = () => {
    setIsAnnual(!isAnnual);
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {/* Tier 1: Founder Essential */}
          <PricingCard
            title="Founder Essential"
            price={99}
            annualPrice={950.4} // 20% discount
            features={[
              '2 × 20-minute video sessions (40 minutes total)',
              'Unlimited text mentorship with general AI mentor',
              'Document generation: BYOK or 25,000 tokens included (~10 documents)',
              'Mobile app access with offline capabilities',
              'Basic analytics dashboard',
              'Community access to founder network',
              'Email support (48-hour response)'
            ]}
            isPopular={false}
            isAnnual={isAnnual}
            priceId={isAnnual ? 'price_1Rd8NVD5a0uk1qUEQSEg8jCp_yearly' : 'price_1Rd8NVD5a0uk1qUEQSEg8jCp'}
            mode="subscription"
            badge="🚀 BEST FOR GETTING STARTED"
            subtitle="Perfect for getting started with AI mentorship"
            hasTrial={true}
          />
          
          {/* Tier 2: Founder Companion */}
          <PricingCard
            title="Founder Companion"
            price={199}
            annualPrice={1910.4} // 20% discount
            features={[
              '3 × 25-minute video sessions (75 minutes total)',
              'Unlimited text & voice mentorship with personalized AI mentor',
              'Document generation: BYOK or 50,000 tokens included (~20 documents)',
              'Session recordings with AI-generated insights and action items',
              'Priority AI responses (<30 seconds)',
              'Mobile + web platform access',
              'Advanced analytics with progress tracking',
              'Priority support (24-hour response)'
            ]}
            isPopular={true}
            isAnnual={isAnnual}
            priceId={isAnnual ? 'price_1Rd8NmD5a0uk1qUEF5N4AXbq_yearly' : 'price_1Rd8NmD5a0uk1qUEF5N4AXbq'}
            mode="subscription"
            badge="⭐ MOST POPULAR"
            subtitle="Your trusted AI mentor for critical decisions"
            hasTrial={true}
          />
          
          {/* Tier 3: Growth Partner */}
          <PricingCard
            title="Growth Partner"
            price={449}
            annualPrice={4310.4} // 20% discount
            features={[
              '5 × 30-minute video sessions (150 minutes total)',
              'Industry-specific AI mentors (FinTech, HealthTech, B2B SaaS)',
              'Team access for up to 3 members',
              'Document generation: BYOK or 100,000 tokens included (~40 documents)',
              'Real-time collaboration on documents and strategy',
              'Advanced business intelligence and competitive analysis',
              'Integration suite (Slack, Notion, Google Workspace)',
              'Quarterly strategic planning sessions',
              'Dedicated customer success manager'
            ]}
            isPopular={false}
            isAnnual={isAnnual}
            priceId={isAnnual ? 'price_1Rd8O4D5a0uk1qUEb76A0qe2_yearly' : 'price_1Rd8O4D5a0uk1qUEb76A0qe2'}
            mode="subscription"
            badge="🎯 SCALING STARTUPS"
            subtitle="Strategic AI mentorship for scaling startups"
            hasTrial={true}
          />
          
          {/* Tier 4: Expert Advisor */}
          <PricingCard
            title="Expert Advisor"
            price={899}
            annualPrice={8630.4} // 20% discount
            features={[
              '8 × 30-minute video sessions (240 minutes total)',
              'Unlimited access to specialized AI advisors (legal, finance, product, sales)',
              'Unlimited team access with role-based permissions',
              'Unlimited document generation: BYOK or unlimited tokens',
              '24/7 crisis support with immediate AI mentor availability',
              'Custom AI mentor training on your specific business context',
              'Advanced compliance guidance for regulated industries',
              'Monthly strategy session with human expert validation',
              'White-label options for portfolio companies',
              'API access for custom integrations'
            ]}
            isPopular={false}
            isAnnual={isAnnual}
            priceId={isAnnual ? 'price_1Rd8OKD5a0uk1qUEXnVvuqO9_yearly' : 'price_1Rd8OKD5a0uk1qUEXnVvuqO9'}
            mode="subscription"
            badge="👑 PREMIUM"
            subtitle="Your personal AI advisory board"
            hasTrial={true}
          />
        </div>
        
        {/* Enterprise Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 bg-primary/5 rounded-xl p-8 border border-primary/20"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-2">Enterprise Solutions</h3>
              <p className="text-text-secondary max-w-2xl">
                Custom AI mentorship solutions for accelerators, VC firms, and enterprise innovation teams.
                White-label options, custom integrations, and dedicated support.
              </p>
            </div>
            <Button 
              variant="primary" 
              size="lg" 
              className="mt-4 md:mt-0"
              onClick={() => window.location.href = 'mailto:enterprise@abiah.help'}
            >
              Contact Sales
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}