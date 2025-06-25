import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  User, 
  Bot, 
  Mic, 
  MicOff, 
  Zap, 
  Eye, 
  Brain, 
  Clock,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button-bkp';
import { supabase } from '../../lib/supabase';

interface LiveConversationEvent {
  id: string;
  type: 'utterance' | 'tool_call' | 'speaking_state_change' | 'perception_tool_call' | 'perception_analysis' | 'live_interaction';
  timestamp: string;
  data: any;
}

interface ConversationState {
  status: 'waiting' | 'in_progress' | 'completed' | 'error';
  userSpeaking: boolean;
  aiSpeaking: boolean;
  lastUtterance?: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
  activeToolCalls: string[];
  perceptionActive: boolean;
  messageCount: number;
  duration: number;
}

interface LiveConversationMonitorProps {
  conversationId: string;
  userId: string;
  isVisible?: boolean;
  position?: 'floating' | 'sidebar' | 'bottom';
  onToggleVisibility?: () => void;
}

export function LiveConversationMonitor({
  conversationId,
  userId,
  isVisible = true,
  position = 'floating',
  onToggleVisibility
}: LiveConversationMonitorProps) {
  const [events, setEvents] = useState<LiveConversationEvent[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>({
    status: 'waiting',
    userSpeaking: false,
    aiSpeaking: false,
    activeToolCalls: [],
    perceptionActive: false,
    messageCount: 0,
    duration: 0
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const durationInterval = useRef<NodeJS.Timeout>();

  // Auto-scroll to latest events
  useEffect(() => {
    if (eventsRef.current) {
      eventsRef.current.scrollTop = eventsRef.current.scrollHeight;
    }
  }, [events]);

  // Duration timer
  useEffect(() => {
    if (conversationState.status === 'in_progress' && startTime) {
      durationInterval.current = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setConversationState(prev => ({ ...prev, duration }));
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [conversationState.status, startTime]);

  // Real-time subscription to conversation updates
  useEffect(() => {
    if (!userId || !conversationId) return;

    console.log('Setting up live conversation monitoring for:', conversationId);

    const channel = supabase
      .channel(`user-${userId}`)
      .on('broadcast', { event: 'conversation_update' }, (payload) => {
        const { type, data } = payload.payload;
        handleRealTimeEvent(type, data);
      })
      .subscribe();

    return () => {
      console.log('Cleaning up live conversation monitoring');
      channel.unsubscribe();
    };
  }, [userId, conversationId]);

  const handleRealTimeEvent = (type: string, data: any) => {
    const event: LiveConversationEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type: type as any,
      timestamp: new Date().toISOString(),
      data
    };

    // Add event to the stream
    setEvents(prev => [...prev.slice(-50), event]); // Keep last 50 events

    // Update conversation state based on event type
    switch (type) {
      case 'conversation_started':
        setConversationState(prev => ({ 
          ...prev, 
          status: 'in_progress' 
        }));
        setStartTime(new Date());
        break;

      case 'conversation_ended':
      case 'conversation_completed':
        setConversationState(prev => ({ 
          ...prev, 
          status: 'completed',
          userSpeaking: false,
          aiSpeaking: false
        }));
        break;

      case 'utterance':
        setConversationState(prev => ({
          ...prev,
          lastUtterance: {
            role: data.role,
            content: data.content,
            timestamp: event.timestamp
          },
          messageCount: prev.messageCount + 1
        }));
        break;

      case 'speaking_state_change':
        if (data.speaker === 'user') {
          setConversationState(prev => ({
            ...prev,
            userSpeaking: data.state === 'started'
          }));
        } else if (data.speaker === 'replica') {
          setConversationState(prev => ({
            ...prev,
            aiSpeaking: data.state === 'started'
          }));
        }
        break;

      case 'tool_call':
        setConversationState(prev => ({
          ...prev,
          activeToolCalls: [...prev.activeToolCalls, data.functionName]
        }));
        // Remove tool call after 5 seconds
        setTimeout(() => {
          setConversationState(prev => ({
            ...prev,
            activeToolCalls: prev.activeToolCalls.filter(name => name !== data.functionName)
          }));
        }, 5000);
        break;

      case 'perception_tool_call':
      case 'perception_analysis':
        setConversationState(prev => ({
          ...prev,
          perceptionActive: true
        }));
        // Reset perception indicator after 3 seconds
        setTimeout(() => {
          setConversationState(prev => ({
            ...prev,
            perceptionActive: false
          }));
        }, 3000);
        break;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (conversationState.status) {
      case 'in_progress': return 'text-success';
      case 'completed': return 'text-primary';
      case 'error': return 'text-error';
      default: return 'text-neutral-500';
    }
  };

  const getStatusIcon = () => {
    switch (conversationState.status) {
      case 'in_progress': return <Activity className="w-4 h-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderEvent = (event: LiveConversationEvent) => {
    const getEventIcon = () => {
      switch (event.type) {
        case 'utterance':
          return event.data.role === 'user' ? 
            <User className="w-3 h-3 text-primary" /> : 
            <Bot className="w-3 h-3 text-secondary" />;
        case 'tool_call':
          return <Zap className="w-3 h-3 text-warning" />;
        case 'speaking_state_change':
          return event.data.state === 'started' ? 
            <Volume2 className="w-3 h-3 text-success" /> : 
            <VolumeX className="w-3 h-3 text-neutral-400" />;
        case 'perception_tool_call':
        case 'perception_analysis':
          return <Eye className="w-3 h-3 text-info" />;
        case 'live_interaction':
          return <Brain className="w-3 h-3 text-purple-500" />;
        default:
          return <MessageSquare className="w-3 h-3 text-neutral-400" />;
      }
    };

    const getEventText = () => {
      switch (event.type) {
        case 'utterance':
          return `${event.data.role === 'user' ? 'You' : 'AI'}: ${event.data.content?.substring(0, 50)}${event.data.content?.length > 50 ? '...' : ''}`;
        case 'tool_call':
          return `AI executing: ${event.data.functionName}`;
        case 'speaking_state_change':
          const speaker = event.data.speaker === 'user' ? 'You' : 'AI';
          const action = event.data.state === 'started' ? 'started speaking' : 'stopped speaking';
          return `${speaker} ${action}`;
        case 'perception_tool_call':
          return `AI analyzing visual context: ${event.data.visualContext?.substring(0, 40)}...`;
        case 'perception_analysis':
          return `Visual analysis: ${event.data.analysis?.substring(0, 40)}...`;
        case 'live_interaction':
          return `Live interaction: ${event.data.interactionType}`;
        default:
          return 'Conversation event';
      }
    };

    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start gap-2 py-1 text-xs"
      >
        <div className="flex-shrink-0 mt-0.5">
          {getEventIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-text-primary truncate">
            {getEventText()}
          </div>
          <div className="text-text-secondary text-xs">
            {new Date(event.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  if (!isVisible) return null;

  const containerClass = {
    floating: 'fixed bottom-4 right-4 z-50 w-80',
    sidebar: 'w-full h-full',
    bottom: 'fixed bottom-0 left-0 right-0 z-50'
  }[position];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={containerClass}
    >
      <Card className="bg-white/95 backdrop-blur-sm border shadow-lg">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-sm font-medium">
                  {conversationState.status === 'in_progress' ? 'Live Conversation' :
                   conversationState.status === 'completed' ? 'Completed' :
                   conversationState.status === 'waiting' ? 'Waiting...' : 'Error'}
                </span>
              </div>
              {conversationState.status === 'in_progress' && (
                <div className="text-xs text-text-secondary">
                  {formatDuration(conversationState.duration)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-xs"
              >
                {isMinimized ? 'Show' : 'Hide'}
              </Button>
              {onToggleVisibility && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleVisibility}
                  className="text-xs"
                >
                  ×
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded">
                    {conversationState.userSpeaking ? (
                      <Mic className="w-4 h-4 text-success animate-pulse" />
                    ) : (
                      <MicOff className="w-4 h-4 text-neutral-400" />
                    )}
                    <span className="text-xs">
                      You {conversationState.userSpeaking ? 'speaking' : 'listening'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded">
                    {conversationState.aiSpeaking ? (
                      <Volume2 className="w-4 h-4 text-secondary animate-pulse" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-neutral-400" />
                    )}
                    <span className="text-xs">
                      AI {conversationState.aiSpeaking ? 'speaking' : 'listening'}
                    </span>
                  </div>
                </div>

                {/* Active Indicators */}
                {(conversationState.activeToolCalls.length > 0 || conversationState.perceptionActive) && (
                  <div className="mb-3 space-y-1">
                    {conversationState.activeToolCalls.map(toolName => (
                      <div key={toolName} className="flex items-center gap-2 p-2 bg-warning/10 rounded">
                        <Zap className="w-3 h-3 text-warning animate-spin" />
                        <span className="text-xs text-warning">
                          Generating: {toolName.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                    
                    {conversationState.perceptionActive && (
                      <div className="flex items-center gap-2 p-2 bg-info/10 rounded">
                        <Eye className="w-3 h-3 text-info animate-pulse" />
                        <span className="text-xs text-info">
                          Analyzing visual context
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-3 text-xs text-text-secondary">
                  <div>Messages: {conversationState.messageCount}</div>
                  <div>Events: {events.length}</div>
                </div>

                {/* Recent Events */}
                <div className="border-t pt-3">
                  <div className="text-xs font-medium text-text-primary mb-2">Recent Activity</div>
                  <div 
                    ref={eventsRef}
                    className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin scrollbar-track-neutral-100 scrollbar-thumb-neutral-300"
                  >
                    {events.length === 0 ? (
                      <div className="text-xs text-text-secondary italic py-2">
                        No activity yet...
                      </div>
                    ) : (
                      events.slice(-10).map(renderEvent)
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}