import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Lightbulb, Compass, Zap, Users } from 'lucide-react';
import { Card3D } from '../effects';

export function ValuesSection() {
  const values = [
    {
      icon: Heart,
      title: 'Empathy First',
      description: 'We understand the emotional journey of founders and design every interaction to provide support, confidence, and clarity.'
    },
    {
      icon: Shield,
      title: 'Trust & Reliability',
      description: 'We build systems that founders can depend on during their most critical moments, with consistent quality and unwavering availability.'
    },
    {
      icon: Lightbulb,
      title: 'Continuous Innovation',
      description: 'We constantly push the boundaries of AI mentorship, improving our technology to deliver increasingly personalized and effective guidance.'
    },
    {
      icon: Compass,
      title: 'Outcome Focused',
      description: 'Everything we do is measured by one metric: helping founders achieve successful funding outcomes and business growth.'
    },
    {
      icon: Zap,
      title: 'Accessibility',
      description: 'We democratize world-class mentorship, making it available to founders regardless of location, network, or resources.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We foster a supportive ecosystem where founders can learn from each other\'s journeys and celebrate collective success.'
    }
  ];
  
  return (
    <div className="py-20 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Our <span className="text-primary">Core</span> <span className="text-secondary">Values</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            These principles guide everything we do, from product development to customer interactions.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <Card3D key={index} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 h-full"
                >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                
                  <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                  
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              </Card3D>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}