import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, FileText, Eye } from 'lucide-react';
import { Button } from '../ui/Button-bkp';

interface ConversationStatusBarProps {
  isCompleted: boolean;
  completionTime?: string;
  hasTranscript?: boolean;
  onViewTranscript?: () => void;
  error?: string | null;
}

export function ConversationStatusBar({
  isCompleted,
  completionTime,
  hasTranscript = false,
  onViewTranscript,
  error
}: ConversationStatusBarProps) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6 flex items-center"
      >
        <AlertCircle className="w-5 h-5 text-error mr-3 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-error">Conversation Error</h3>
          <p className="text-sm text-error/80">{error}</p>
        </div>
      </motion.div>
    );
  }
  
  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6 flex items-center justify-between"
      >
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-success mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-success">Conversation Completed</h3>
            <p className="text-sm text-success/80">
              {completionTime 
                ? `Completed at ${new Date(completionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                : 'Your conversation has been saved'}
            </p>
          </div>
        </div>
        
        {hasTranscript && onViewTranscript && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewTranscript}
            className="border-success text-success hover:bg-success/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Transcript
          </Button>
        )}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center"
    >
      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin mr-3" />
      <div>
        <h3 className="font-medium text-primary">Conversation in Progress</h3>
        <p className="text-sm text-primary/80">
          Your conversation will be saved when completed
        </p>
      </div>
    </motion.div>
  );
}