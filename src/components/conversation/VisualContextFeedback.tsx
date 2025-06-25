import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Camera, 
  Scan, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Image,
  Layers,
  Target,
  BarChart3,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button-bkp';
import { Card } from '../ui/Card';

interface PerceptionEvent {
  id: string;
  eventType: 'perception_tool_call' | 'perception_analysis';
  visualContext?: string;
  detectedObjects?: string[];
  analysisResult?: string;
  confidenceScore?: number;
  inferenceId?: string;
  timestamp: number;
  status: 'analyzing' | 'completed' | 'failed';
}

interface VisualContextFeedbackProps {
  perceptionEvents: PerceptionEvent[];
  isActive: boolean;
  position?: 'overlay' | 'sidebar' | 'embedded';
  maxVisible?: number;
  showDetails?: boolean;
  onEventSelect?: (event: PerceptionEvent) => void;
  className?: string;
}

export function VisualContextFeedback({
  perceptionEvents,
  isActive,
  position = 'overlay',
  maxVisible = 10,
  showDetails = true,
  onEventSelect,
  className = ''
}: VisualContextFeedbackProps) {
  const [visibleEvents, setVisibleEvents] = useState<PerceptionEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'analyzing' | 'completed'>('all');

  // Manage visible events
  useEffect(() => {
    let filtered = perceptionEvents;
    
    if (filter !== 'all') {
      filtered = perceptionEvents.filter(event => event.status === filter);
    }
    
    const recent = filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxVisible);
    
    setVisibleEvents(recent);
  }, [perceptionEvents, maxVisible, filter]);

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: PerceptionEvent['status']) => {
    switch (status) {
      case 'analyzing':
        return <Scan className="w-4 h-4 text-warning animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-error" />;
      default:
        return <Eye className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: PerceptionEvent['status']) => {
    switch (status) {
      case 'analyzing':
        return 'border-warning bg-warning/5 text-warning';
      case 'completed':
        return 'border-success bg-success/5 text-success';
      case 'failed':
        return 'border-error bg-error/5 text-error';
      default:
        return 'border-neutral-200 bg-neutral-50 text-neutral-600';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getConfidenceDisplay = (confidence?: number) => {
    if (!confidence) return null;
    
    const percentage = Math.round(confidence * 100);
    const color = percentage >= 80 ? 'text-success' : 
                  percentage >= 60 ? 'text-warning' : 'text-error';
    
    return (
      <div className="flex items-center gap-1">
        <BarChart3 className={`w-3 h-3 ${color}`} />
        <span className={`text-xs font-medium ${color}`}>
          {percentage}%
        </span>
      </div>
    );
  };

  const renderEventCard = (event: PerceptionEvent) => {
    const isExpanded = expandedEvents.has(event.id);
    const isToolCall = event.eventType === 'perception_tool_call';
    
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        layout
        className={`border rounded-lg ${getStatusColor(event.status)} transition-all duration-200`}
      >
        <div className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {isToolCall ? (
                  <Camera className="w-4 h-4 text-secondary" />
                ) : (
                  <Eye className="w-4 h-4 text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-text-primary">
                    {isToolCall ? 'Visual Analysis' : 'Perception Results'}
                  </h4>
                  {getStatusIcon(event.status)}
                  {event.confidenceScore && getConfidenceDisplay(event.confidenceScore)}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(event.timestamp)}</span>
                  {event.inferenceId && (
                    <>
                      <span>•</span>
                      <span className="font-mono">
                        {event.inferenceId.substring(0, 8)}...
                      </span>
                    </>
                  )}
                </div>
                
                {/* Quick preview */}
                {event.status === 'completed' && (
                  <div className="space-y-1">
                    {event.detectedObjects && event.detectedObjects.length > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Target className="w-3 h-3 text-secondary" />
                        <span className="text-text-secondary">
                          {event.detectedObjects.length} object{event.detectedObjects.length !== 1 ? 's' : ''} detected
                        </span>
                      </div>
                    )}
                    
                    {event.visualContext && !isExpanded && (
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {event.visualContext.length > 100 
                          ? `${event.visualContext.substring(0, 100)}...`
                          : event.visualContext
                        }
                      </p>
                    )}
                  </div>
                )}
                
                {event.status === 'analyzing' && (
                  <p className="text-xs text-warning">
                    Analyzing visual context...
                  </p>
                )}
                
                {event.status === 'failed' && (
                  <p className="text-xs text-error">
                    Analysis failed
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {showDetails && event.status === 'completed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleEventExpansion(event.id)}
                  className="w-6 h-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </Button>
              )}
              
              {onEventSelect && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEventSelect(event)}
                  className="w-6 h-6 p-0"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Expanded details */}
          <AnimatePresence>
            {isExpanded && event.status === 'completed' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 pt-3 border-t border-neutral-200 space-y-3"
              >
                {/* Visual Context */}
                {event.visualContext && (
                  <div>
                    <h5 className="text-xs font-medium text-text-primary mb-1 flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      Visual Context
                    </h5>
                    <p className="text-xs text-text-secondary leading-relaxed bg-neutral-50 p-2 rounded">
                      {event.visualContext}
                    </p>
                  </div>
                )}
                
                {/* Detected Objects */}
                {event.detectedObjects && event.detectedObjects.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-text-primary mb-1 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Detected Objects
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {event.detectedObjects.map((object, index) => (
                        <span
                          key={index}
                          className="inline-block bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full"
                        >
                          {object}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Analysis Result */}
                {event.analysisResult && (
                  <div>
                    <h5 className="text-xs font-medium text-text-primary mb-1 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      Analysis Result
                    </h5>
                    <p className="text-xs text-text-secondary leading-relaxed bg-neutral-50 p-2 rounded">
                      {event.analysisResult}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const getPositionClasses = () => {
    const baseClasses = 'bg-white border rounded-lg shadow-lg';
    
    switch (position) {
      case 'overlay':
        return `${baseClasses} fixed top-4 right-4 w-80 max-h-96 z-40`;
      case 'sidebar':
        return `${baseClasses} h-full w-full`;
      case 'embedded':
        return `${baseClasses} w-full max-h-64`;
      default:
        return baseClasses;
    }
  };

  if (!isActive && visibleEvents.length === 0) {
    return null;
  }

  return (
    <div className={`${getPositionClasses()} ${className} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text-primary">
            Visual Analysis
          </h3>
          {isActive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success font-medium">ACTIVE</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter buttons */}
          <div className="flex items-center gap-1">
            {(['all', 'analyzing', 'completed'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="text-xs h-6 px-2"
              >
                {filterType === 'all' ? 'All' : 
                 filterType === 'analyzing' ? 'Active' : 'Done'}
              </Button>
            ))}
          </div>
          
          <span className="text-xs text-text-secondary">
            {visibleEvents.length}
          </span>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {visibleEvents.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-text-secondary">
              {isActive ? 'Waiting for visual analysis...' : 'No visual data available'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {visibleEvents.map(event => renderEventCard(event))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Hook to manage visual context feedback data
export function useVisualContextFeedback() {
  const [perceptionEvents, setPerceptionEvents] = useState<PerceptionEvent[]>([]);
  const [isActive, setIsActive] = useState(false);

  const addPerceptionEvent = (
    eventType: PerceptionEvent['eventType'],
    data: Partial<PerceptionEvent>
  ) => {
    const event: PerceptionEvent = {
      id: `${eventType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      timestamp: Date.now(),
      status: 'analyzing',
      ...data
    };

    setPerceptionEvents(prev => [...prev, event]);
    return event.id;
  };

  const updatePerceptionEvent = (id: string, updates: Partial<PerceptionEvent>) => {
    setPerceptionEvents(prev => 
      prev.map(event => 
        event.id === id ? { ...event, ...updates } : event
      )
    );
  };

  const clearEvents = () => {
    setPerceptionEvents([]);
  };

  const setActiveState = (active: boolean) => {
    setIsActive(active);
  };

  return {
    perceptionEvents,
    isActive,
    addPerceptionEvent,
    updatePerceptionEvent,
    clearEvents,
    setActiveState
  };
}