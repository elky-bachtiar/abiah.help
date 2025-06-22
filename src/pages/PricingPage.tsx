import React from 'react';
import { motion } from 'framer-motion';
import { PricingSection } from '../components/pricing/PricingSection';

export function PricingPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Choose the plan that's right for your startup's stage and needs.
              All plans include our core AI mentorship features.
            </p>
          </motion.div>
        </div>
      </div>
      
      <PricingSection />
      
      {/* FAQ Section */}
      <div className="py-20 bg-background-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-primary mb-6">
              Frequently Asked Questions
            </h2>
          </motion.div>
          
          <div className="space-y-6">
            {[
              {
                question: 'What happens when I run out of video consultations?',
                answer: 'You can purchase additional consultation credits at any time, or upgrade to a higher tier plan for more included consultations. Unused consultations roll over for up to 3 months.'
              },
              {
                question: 'Can I change plans at any time?',
                answer: 'Yes, you can upgrade your plan at any time and the new features will be immediately available. When downgrading, changes will take effect at the start of your next billing cycle.'
              },
              {
                question: 'Is there a free trial available?',
                answer: 'Yes, we offer a 14-day free trial of the Growth Accelerator plan for new users. No credit card required to start your trial.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans. Annual plans can also be paid via invoice.'
              },
              {
                question: 'Do you offer discounts for startups or non-profits?',
                answer: 'Yes, we offer special pricing for early-stage startups, non-profits, and educational institutions. Contact our sales team for more information.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden"
              >
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer p-6">
                    <h3 className="text-lg font-semibold text-primary">{faq.question}</h3>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pt-0 text-text-secondary">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-text-secondary mb-4">
              Have more questions? We're here to help.
            </p>
            <a 
              href="mailto:sales@abiah.help"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              Contact our sales team
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}