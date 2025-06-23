import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { TeamSection } from '../components/team/TeamSection';
import { PricingSection } from '../components/pricing/PricingSection';
 
export function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Additional sections can be added here */}
      <section id="consultation-section" className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">
            Ready to Start Your AI Consultation? 
          </h2>
          <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto">
            Join thousands of founders who have accelerated their startup journey with personalized AI mentorship.
          </p>
        </div>
      </section>
    
      
      {/* Pricing Section */}
      <PricingSection />
    </div>
  );
}