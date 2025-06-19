import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Cpu, Video } from 'lucide-react';
import { conversationScreenAtom } from '../../store/consultation';
import { LoadingSpinner, LoadingDots } from '../ui/LoadingSpinner';

const loadingSteps = [
  { id: 1, text: 'Initializing AI mentor...', icon: Cpu, duration: 2000 },
  { id: 2, text: 'Preparing video connection...', icon: Video, duration: 1500 },
  { id: 3, text: 'Setting up consultation room...', icon: Clock, duration: 1000 },
  { id: 4, text: 'Ready to begin!', icon: CheckCircle, duration: 500 },
];

export function LoadingScreen() {
  const [, setCurrentScreen] = useAtom(conversationScreenAtom);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const processSteps = async () => {
      for (let i = 0; i < loadingSteps.length; i++) {
        setCurrentStep(i);
        
        await new Promise(resolve => {
          timeoutId = setTimeout(() => {
            setCompletedSteps(prev => [...prev, i]);
            resolve(void 0);
          }, loadingSteps[i].duration);
        });
      }
      
      // After all steps complete, move to settings
      setTimeout(() => {
        setCurrentScreen('settings');
      }, 500);
    };

    processSteps();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [setCurrentScreen]);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12"
      >
        {/* Main Loading Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <LoadingSpinner size="lg" />
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Preparing Your AI Consultation
          </h2>
          
          <p className="text-white/70 text-lg">
            This will only take a moment...
          </p>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => {
            const IconComponent = step.icon;
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;
            const isPending = currentStep < index;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex items-center justify-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500/20 text-green-300' 
                    : isCurrent 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/5 text-white/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isCurrent 
                    ? 'bg-secondary' 
                    : 'bg-white/10'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                </div>
                
                <span className="font-medium">
                  {step.text}
                </span>
                
                {isCurrent && (
                  <div className="ml-2">
                    <LoadingDots />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8">
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-secondary rounded-full h-2"
              style={{ width: `${((completedSteps.length + 1) / loadingSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-white/60 text-sm mt-2">
            {completedSteps.length + 1} of {loadingSteps.length} steps complete
          </p>
        </div>
      </motion.div>

      {/* Fun Facts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-8 text-white/60 text-sm"
      >
        <p>💡 Did you know? 90% of startups fail due to lack of market need.</p>
        <p className="mt-1">Our AI mentor helps you validate and refine your market approach.</p>
      </motion.div>
    </div>
  );
}