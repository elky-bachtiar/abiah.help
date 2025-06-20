import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Target } from 'lucide-react';
import { cn } from '../../lib/utils';
  
interface ProgressBarProps {
  percentage: number;
  totalSections: number;
  completedSections: number;
  timeSpent?: number;
  className?: string;
  showDetails?: boolean;
}

export function ProgressBar({ 
  percentage, 
  totalSections, 
  completedSections, 
  timeSpent = 0,
  className,
  showDetails = true 
}: ProgressBarProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60); 
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Reading Progress
        </h3>
        <div className="text-2xl font-bold text-primary">
          {Math.round(percentage)}%
        </div>
      </div> 

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="bg-neutral-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <CheckCircle className="w-5 h-5 text-success mb-1" />
            <div className="text-sm font-medium text-primary">
              {completedSections}/{totalSections}
            </div>
            <div className="text-xs text-text-secondary">Sections</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Clock className="w-5 h-5 text-warning mb-1" />
            <div className="text-sm font-medium text-primary">
              {formatTime(timeSpent)}
            </div>
            <div className="text-xs text-text-secondary">Time Spent</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Target className="w-5 h-5 text-primary mb-1" />
            <div className="text-sm font-medium text-primary">
              {totalSections - completedSections}
            </div>
            <div className="text-xs text-text-secondary">Remaining</div>
          </div>
        </div>
      )}

      {percentage === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg text-center"
        >
          <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-success font-medium">Document completed!</p>
          <p className="text-success/80 text-sm">Great job reviewing all sections.</p>
        </motion.div>
      )}
    </div>
  );
}