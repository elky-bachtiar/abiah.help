import React from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Calendar, ArrowRight, Star, Clock, Target } from 'lucide-react';
import { conversationScreenAtom, sessionTimerAtom } from '../../store/consultation'; 
import { userDisplayNameAtom } from '../../store/auth';
import { Button } from '../ui/Button-bkp';
import { Card } from '../ui/Card';
import { formatDuration } from '../../lib/utils';

export function SummaryScreen() {
  const [, setCurrentScreen] = useAtom(conversationScreenAtom);
  const [sessionTimer] = useAtom(sessionTimerAtom);
  const [displayName] = useAtom(userDisplayNameAtom);

  const sessionDuration = formatDuration(sessionTimer.duration);

  const keyInsights = [
    { 
      title: 'Market Validation',
      insight: 'Focus on validating your target market through customer interviews and MVP testing.',
      priority: 'high',
    },
    {
      title: 'Revenue Model',
      insight: 'Consider implementing a freemium model to accelerate user acquisition.',
      priority: 'medium',
    },
    { 
      title: 'Competitive Advantage',
      insight: 'Strengthen your moat by building network effects into your platform.',
      priority: 'high',
    },
  ];

  const nextSteps = [
    'Conduct 20 customer interviews within the next 2 weeks',
    'Create a detailed financial model with unit economics',
    'Develop a go-to-market strategy for your first 1,000 users',
    'Prepare a compelling pitch deck for seed funding',
  ];

  const handleScheduleFollowUp = () => {
    // Navigate to scheduling page
    console.log('Schedule follow-up consultation');
  };

  const handleDownloadSummary = () => {
    // Generate and download PDF summary
    console.log('Download consultation summary');
  };

  const handleBackToDashboard = () => {
    // Navigate back to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
         
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Great Session, {displayName}!
        </h1>
        
        <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Your consultation is complete. Here's a summary of key insights and next steps 
          to accelerate your startup's growth.
        </p>
      </motion.div>

      {/* Session Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center p-4">
          <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold">{sessionDuration}</div>
          <div className="text-white/70 text-sm">Session Duration</div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center p-4">
          <Target className="w-8 h-8 text-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold">{keyInsights.length}</div>
          <div className="text-white/70 text-sm">Key Insights</div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center p-4">
          <Star className="w-8 h-8 text-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold">{nextSteps.length}</div>
          <div className="text-white/70 text-sm">Action Items</div>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6 h-full">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-secondary" />
              Key Insights
            </h3>
            
            <div className="space-y-4">
              {keyInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="border-l-4 border-secondary pl-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.priority === 'high' 
                        ? 'bg-red-500/20 text-red-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {insight.priority} priority
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{insight.insight}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6 h-full">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-secondary" />
              Recommended Next Steps
            </h3>
            
            <div className="space-y-3">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-white/80">{step}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          size="lg"
          variant="secondary"
          onClick={handleDownloadSummary}
          className="group"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Summary
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={handleScheduleFollowUp}
          className="border-white text-white hover:bg-white hover:text-primary group"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Schedule Follow-up
        </Button>
        
        <Button
          size="lg"
          variant="ghost"
          onClick={handleBackToDashboard}
          className="text-white hover:bg-white/10 group"
        >
          Back to Dashboard
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>

      {/* Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="mt-12 text-center"
      >
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
          <h3 className="text-lg font-semibold mb-3">How was your consultation?</h3>
          <p className="text-white/70 mb-4">Your feedback helps us improve the AI mentorship experience.</p>
          
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-secondary hover:bg-secondary/20 transition-colors flex items-center justify-center"
              >
                <Star className="w-5 h-5 text-white/60 hover:text-secondary" />
              </button>
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-primary">
            Leave Detailed Feedback
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}