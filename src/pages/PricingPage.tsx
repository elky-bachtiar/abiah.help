import React from 'react';
import { motion } from 'framer-motion';
import { PricingSection } from '../components/pricing/PricingSection';
import { CheckCircle } from 'lucide-react';

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
              AI Mentorship Pricing
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Choose the plan that's right for your startup journey.
              All plans include a 5-day free trial with no credit card required.
            </p>
          </motion.div>
        </div>
      </div>
      
      <PricingSection />
      
      {/* Guarantee Section */}
      <div className="py-12 bg-background-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-primary/5 rounded-xl p-8 border border-primary/20 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-3">30-Day Money-Back Guarantee</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              If you're not completely satisfied with your Abiah.help experience within the first 30 days,
              we'll refund your subscription. No questions asked.
            </p>
          </motion.div>
        </div>
      </div>
      
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
                question: 'How does the 5-day free trial work?',
                answer: 'You can try any plan free for 5 days with no credit card required. You\'ll get full access to all features included in your selected plan. At the end of the trial, you can choose to continue with a paid subscription or cancel anytime.'
              },
              {
                question: 'Can I change plans at any time?',
                answer: 'Yes, you can upgrade your plan at any time and the new features will be immediately available. When downgrading, changes will take effect at the start of your next billing cycle.'
              },
              {
                question: 'What happens when I run out of video consultations?',
                answer: 'You can purchase additional consultation credits at any time, or upgrade to a higher tier plan for more included consultations. Unused consultations roll over for up to 3 months.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans. Annual plans can also be paid via invoice.'
              },
              {
                question: 'Do you offer discounts for startups or non-profits?',
                answer: 'Yes, we offer special pricing for early-stage startups, non-profits, and educational institutions. We also offer a 20% discount for annual subscriptions. Contact our sales team for more information.'
              },
              {
                question: 'What does BYOK mean in the document generation feature?',
                answer: 'BYOK stands for "Bring Your Own Key" and refers to using your own OpenAI or Anthropic API key for document generation. This allows you to use your own API credits while still benefiting from our specialized document templates and AI guidance.'
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
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}