import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  FileText, 
  BarChart3, 
  PresentationChart, 
  CheckCircle, 
  AlertCircle,
  X,
  Download,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/Button-bkp';
import { Card } from '../ui/Card';

interface ToolExecution {
  id: string;
  toolName: string;
  status: 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startTime: number;
  endTime?: number;
}

interface ToolExecutionNotificationProps {
  executions: ToolExecution[];
  onDismiss?: (id: string) => void;
  onViewResult?: (execution: ToolExecution) => void;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  maxVisible?: number;
}

export function ToolExecutionNotification({
  executions,
  onDismiss,
  onViewResult,
  position = 'top-right',
  maxVisible = 3
}: ToolExecutionNotificationProps) {
  const [visibleExecutions, setVisibleExecutions] = useState<ToolExecution[]>([]);

  // Manage visible notifications
  useEffect(() => {
    // Show most recent executions up to maxVisible
    const recent = executions
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, maxVisible);
    
    setVisibleExecutions(recent);
  }, [executions, maxVisible]);

  // Auto-dismiss completed executions after delay
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    visibleExecutions.forEach(execution => {
      if (execution.status === 'completed' && !execution.error) {
        const timer = setTimeout(() => {
          onDismiss?.(execution.id);
        }, 5000); // Auto-dismiss after 5 seconds
        timers.push(timer);
      }
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [visibleExecutions, onDismiss]);

  const getToolIcon = (toolName: string) => {
    switch (toolName.toLowerCase()) {
      case 'generate_pitch_deck':
        return <PresentationChart className="w-4 h-4" />;
      case 'create_business_plan':
        return <FileText className="w-4 h-4" />;
      case 'analyze_market_research':
        return <BarChart3 className="w-4 h-4" />;
      case 'generate_consultation_summary':
        return <FileText className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getToolDisplayName = (toolName: string) => {
    const names: Record<string, string> = {
      'generate_pitch_deck': 'Pitch Deck',
      'create_business_plan': 'Business Plan',
      'analyze_market_research': 'Market Analysis',
      'generate_consultation_summary': 'Consultation Summary'
    };
    return names[toolName] || toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (execution: ToolExecution) => {
    switch (execution.status) {
      case 'executing':
        return 'border-warning bg-warning/5 text-warning';
      case 'completed':
        return execution.error 
          ? 'border-error bg-error/5 text-error'
          : 'border-success bg-success/5 text-success';
      case 'failed':
        return 'border-error bg-error/5 text-error';
      default:
        return 'border-neutral-200 bg-neutral-50 text-neutral-600';
    }
  };

  const getStatusIcon = (execution: ToolExecution) => {
    switch (execution.status) {
      case 'executing':
        return <Zap className="w-4 h-4 animate-spin" />;
      case 'completed':
        return execution.error 
          ? <AlertCircle className="w-4 h-4" />
          : <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getDuration = (execution: ToolExecution) => {
    const end = execution.endTime || Date.now();
    const duration = Math.round((end - execution.startTime) / 1000);
    return `${duration}s`;
  };

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 space-y-2';
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  if (visibleExecutions.length === 0) return null;

  return (
    <div className={getPositionClasses()}>
      <AnimatePresence mode="popLayout">
        {visibleExecutions.map((execution) => (
          <motion.div
            key={execution.id}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            layout
            className="w-80"
          >
            <Card className={`border-l-4 ${getStatusColor(execution)} shadow-lg`}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getToolIcon(execution.toolName)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-text-primary">
                          {getToolDisplayName(execution.toolName)}
                        </h4>
                        {getStatusIcon(execution)}
                      </div>
                      
                      <div className="mt-1 text-xs text-text-secondary">
                        {execution.status === 'executing' && 'AI is generating your document...'}
                        {execution.status === 'completed' && !execution.error && 'Document generated successfully!'}
                        {execution.status === 'completed' && execution.error && `Error: ${execution.error}`}
                        {execution.status === 'failed' && 'Generation failed'}
                      </div>
                      
                      {execution.status !== 'executing' && (
                        <div className="mt-1 text-xs text-text-secondary">
                          Completed in {getDuration(execution)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss?.(execution.id)}
                    className="flex-shrink-0 w-6 h-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                {/* Progress bar for executing */}
                {execution.status === 'executing' && (
                  <div className="mt-3">
                    <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-warning rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 30, ease: 'linear' }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Action buttons for completed */}
                {execution.status === 'completed' && !execution.error && execution.result && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewResult?.(execution)}
                      className="flex-1 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    
                    {execution.result.documentUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.open(execution.result.documentUrl, '_blank');
                        }}
                        className="flex-1 text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook to manage tool execution notifications
export function useToolExecutionNotifications() {
  const [executions, setExecutions] = useState<ToolExecution[]>([]);

  const addExecution = (toolName: string, id?: string) => {
    const execution: ToolExecution = {
      id: id || `${toolName}-${Date.now()}`,
      toolName,
      status: 'executing',
      startTime: Date.now()
    };

    setExecutions(prev => [...prev, execution]);
    return execution.id;
  };

  const updateExecution = (id: string, updates: Partial<ToolExecution>) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === id 
        ? { ...exec, ...updates, endTime: updates.status !== 'executing' ? Date.now() : exec.endTime }
        : exec
    ));
  };

  const removeExecution = (id: string) => {
    setExecutions(prev => prev.filter(exec => exec.id !== id));
  };

  const clearAll = () => {
    setExecutions([]);
  };

  return {
    executions,
    addExecution,
    updateExecution,
    removeExecution,
    clearAll
  };
}