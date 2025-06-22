import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Users, Award } from 'lucide-react';

export function MissionSection() {
  return (
    <div className="py-20 bg-background-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Our Mission & Vision
          </h2>
          
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            We're on a mission to democratize startup success by making world-class mentorship accessible to every founder, regardless of location, network, or resources.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Mission Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-primary mb-4">
              Why We Exist
            </h3>
            
            <p className="text-text-secondary mb-6">
              70% of startups fail due to poor documentation timing and founder isolation, representing $228+ billion in wasted investments annually. Traditional solutions like consulting are expensive, inconsistent, and inaccessible when founders need them most.
            </p>
            
            <p className="text-text-secondary mb-6">
              We believe every entrepreneur deserves a trusted mentor who's available 24/7, understands their specific challenges, and provides both emotional support and practical guidance.
            </p>
            
            <h3 className="text-2xl font-bold text-primary mb-4 mt-8">
              Our Vision
            </h3>
            
            <p className="text-text-secondary">
              We envision a world where every founder feels supported, confident, and capable of building world-changing companies. By combining the emotional benefits of human mentorship with the accessibility and consistency of AI, we're creating an entirely new category that addresses the root causes of startup failure.
            </p>
          </motion.div>
          
          {/* Key Pillars */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {[
              {
                icon: Target,
                title: 'Emotional Support',
                description: 'We provide the confidence, validation, and encouragement that founders need during their most challenging moments.'
              },
              {
                icon: Zap,
                title: '24/7 Availability',
                description: 'Critical decisions don't happen during business hours. Our AI mentors are available whenever founders need guidance.'
              },
              {
                icon: Users,
                title: 'Industry Expertise',
                description: 'Our specialized AI mentors understand the unique challenges of different industries, from FinTech to HealthTech.'
              },
              {
                icon: Award,
                title: 'Funding Success',
                description: 'Everything we do is focused on one outcome: helping founders secure the funding they need to bring their vision to life.'
              }
            ].map((pillar, index) => {
              const IconComponent = pillar.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-start space-x-4 bg-background-secondary p-6 rounded-lg"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">{pillar.title}</h4>
                    <p className="text-text-secondary">{pillar.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}