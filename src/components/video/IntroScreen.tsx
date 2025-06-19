import React from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Video, ArrowRight, Clock, Shield, Zap } from 'lucide-react';
import { conversationScreenAtom } from '../../store/consultation';
import { userDisplayNameAtom } from '../../store/auth';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function IntroScreen() {
  const [, setCurrentScreen] = useAtom(conversationScreenAtom);
  const [displayName] = useAtom(userDisplayNameAtom);

  const handleStartConsultation = () => {
    setCurrentScreen('loading');
  };

  const features = [
    {
      icon: Clock,
      title: '30-minute session',
      description: 'Focused mentorship on your key challenges',
    },
    {
      icon: Shield,
      title: 'Private & secure',
      description: 'End-to-end encrypted conversations',
    },
    {
      icon: Zap,
      title: 'Real-time guidance',
      description: 'Instant feedback and actionable advice',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
          <Video className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Ready for Your AI Consultation, {displayName}?
        </h1>
        
        <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          You're about to meet with an AI mentor trained specifically to help startups get funded. 
          Let's accelerate your path to success.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* AI Mentor Preview */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary to-secondary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">AI</span>
              </div>
              
              <h3 className="text-2xl font-semibold mb-2">Meet Abiah</h3>
              <p className="text-white/80 mb-4">
                Your AI startup mentor trained on successful funding strategies 
                from 500+ funded startups.
              </p>
              
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/70 italic">
                  "I'm here to help you refine your pitch, strengthen your business model, 
                  and navigate the funding landscape with confidence."
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Session Features */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">What to Expect</h3>
          
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-12"
      >
        <h3 className="text-xl font-semibold text-white mb-4">💡 Tips for a Great Session</h3>
        <div className="grid md:grid-cols-2 gap-4 text-white/80">
          <ul className="space-y-2">
            <li>• Have your pitch deck or business plan ready</li>
            <li>• Prepare specific questions about funding</li>
            <li>• Be ready to discuss your target market</li>
          </ul>
          <ul className="space-y-2">
            <li>• Know your current revenue and projections</li>
            <li>• Think about your competitive advantages</li>
            <li>• Consider your funding timeline and goals</li>
          </ul>
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="text-center"
      >
        <Button
          size="lg"
          variant="secondary"
          onClick={handleStartConsultation}
          className="group"
        >
          Start My Consultation
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <p className="text-white/60 text-sm mt-4">
          Your session will begin immediately after setup
        </p>
      </motion.div>
    </div>
  );
}