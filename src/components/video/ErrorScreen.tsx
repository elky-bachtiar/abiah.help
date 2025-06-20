import React from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import { conversationScreenAtom } from '../../store/consultation'; 
import { Button } from '../ui/Button-bkp';
import { Card } from '../ui/Card';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  const [, setCurrentScreen] = useAtom(conversationScreenAtom);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else { 
      setCurrentScreen('intro');
    }
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleGetHelp = () => {
    window.location.href = '/help';
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-12">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
           
          {/* Error Message */}
          <h2 className="text-3xl font-bold mb-4">
            Oops! Something went wrong
          </h2>
          
          <p className="text-white/70 text-lg mb-8">
            {message || 'We encountered an issue while setting up your consultation. Please try again or contact support if the problem persists.'}
          </p>

          {/* Error Details */}
          <div className="bg-white/10 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold mb-2">What happened?</h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• There may be a temporary connectivity issue</li>
              <li>• Your browser might not support required features</li>
              <li>• Our AI mentor service might be temporarily unavailable</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleRetry}
              className="group"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={handleGoHome}
              className="border-white text-white hover:bg-white hover:text-primary group"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button
              size="lg"
              variant="ghost"
              onClick={handleGetHelp}
              className="text-white hover:bg-white/10 group"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Get Help
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm">
              Need immediate assistance? Contact our support team at{' '}
              <a href="mailto:support@abiah.help" className="text-secondary hover:text-secondary/80 transition-colors">
                support@abiah.help
              </a>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}