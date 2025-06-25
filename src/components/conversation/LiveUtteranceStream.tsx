import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Clock, MessageSquare, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '../ui/Button-bkp';
import { Card } from '../ui/Card';

interface Utterance {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  inferenceId?: string;
}

interface LiveUtteranceStreamProps {
  conversationId: string;
  isActive: boolean;
  utterances: Utterance[];
  maxVisible?: number;
  position?: 'overlay' | 'sidebar' | 'embedded';
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  showTimestamps?: boolean;
  autoScroll?: boolean;
  className?: string;
}

export function LiveUtteranceStream({
  conversationId,
  isActive,
  utterances,
  maxVisible = 50,
  position = 'overlay',
  isMinimized = false,
  onToggleMinimize,
  showTimestamps = true,
  autoScroll = true,
  className = ''
}: LiveUtteranceStreamProps) {
  const [visibleUtterances, setVisibleUtterances] = useState<Utterance[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  // Manage visible utterances
  useEffect(() => {
    const recent = utterances
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-maxVisible);
    
    setVisibleUtterances(recent);
  }, [utterances, maxVisible]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && isScrolledToBottom && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [visibleUtterances, autoScroll, isScrolledToBottom]);

  // Handle scroll events to detect if user scrolled up
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setIsScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 10);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getPositionClasses = () => {
    const baseClasses = 'bg-white border rounded-lg shadow-lg';
    
    switch (position) {
      case 'overlay':
        return `${baseClasses} fixed z-40 ${isMinimized ? 'w-80 h-12' : 'w-96 h-96'} transition-all duration-300`;
      case 'sidebar':
        return `${baseClasses} h-full w-full`;
      case 'embedded':
        return `${baseClasses} w-full ${isMinimized ? 'h-12' : 'h-64'}`;
      default:
        return baseClasses;
    }
  };

  const renderUtteranceMessage = (utterance: Utterance, index: number) => {
    const isUser = utterance.role === 'user';
    
    return (
      <motion.div
        key={utterance.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`flex gap-3 p-3 ${
          isUser ? 'bg-primary/5' : 'bg-secondary/5'
        } rounded-lg border-l-4 ${
          isUser ? 'border-primary' : 'border-secondary'
        }`}
      >
        <div className="flex-shrink-0">
          {isUser ? (
            <User className={`w-4 h-4 text-primary mt-0.5`} />
          ) : (
            <Bot className={`w-4 h-4 text-secondary mt-0.5`} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${
              isUser ? 'text-primary' : 'text-secondary'
            }`}>
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            
            {showTimestamps && (
              <>
                <Clock className="w-3 h-3 text-text-secondary" />
                <span className="text-xs text-text-secondary">
                  {formatTimestamp(utterance.timestamp)}
                </span>
              </>
            )}
          </div>
          
          <p className="text-sm text-text-primary leading-relaxed break-words">
            {utterance.content}
          </p>
          
          {utterance.inferenceId && (
            <div className="mt-1 text-xs text-text-secondary font-mono">
              ID: {utterance.inferenceId.substring(0, 8)}...
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderMinimizedView = () => (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-text-primary">
          Live Messages
        </span>
        <span className="text-xs text-text-secondary">
          ({visibleUtterances.length})
        </span>
      </div>
      
      {onToggleMinimize && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMinimize}
          className="w-6 h-6 p-0"
        >
          <Maximize2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );

  const renderExpandedView = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text-primary">
            Live Conversation
          </h3>
          {isActive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success font-medium">LIVE</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-secondary">
            {visibleUtterances.length} messages
          </span>
          
          {onToggleMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="w-6 h-6 p-0 ml-2"
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
        style={{ maxHeight: position === 'overlay' ? '320px' : 'auto' }}
      >
        {visibleUtterances.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-text-secondary">
              {isActive ? 'Waiting for messages...' : 'No messages yet'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {visibleUtterances.map((utterance, index) => 
              renderUtteranceMessage(utterance, index)
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Scroll to bottom indicator */}
      {!isScrolledToBottom && visibleUtterances.length > 5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-16 right-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
              }
            }}
            className="text-xs shadow-lg"
          >
            New messages ↓
          </Button>
        </motion.div>
      )}
    </>
  );

  if (!isActive && visibleUtterances.length === 0) {
    return null;
  }

  return (
    <div className={`${getPositionClasses()} ${className} relative`}>
      {isMinimized ? renderMinimizedView() : renderExpandedView()}
    </div>
  );
}

// Hook to manage live utterance stream data
export function useLiveUtteranceStream(conversationId: string) {
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [isActive, setIsActive] = useState(false);

  const addUtterance = (role: 'user' | 'assistant', content: string, inferenceId?: string) => {
    const utterance: Utterance = {
      id: `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now(),
      inferenceId
    };

    setUtterances(prev => [...prev, utterance]);
  };

  const clearUtterances = () => {
    setUtterances([]);
  };

  const setActiveState = (active: boolean) => {
    setIsActive(active);
  };

  // Simulate real-time updates (in production, this would connect to Supabase realtime)
  useEffect(() => {
    if (!conversationId) return;

    // This would be replaced with actual Supabase subscription
    console.log(`Live utterance stream connected for conversation: ${conversationId}`);

    return () => {
      console.log(`Live utterance stream disconnected for conversation: ${conversationId}`);
    };
  }, [conversationId]);

  return {
    utterances,
    isActive,
    addUtterance,
    clearUtterances,
    setActiveState
  };
}

// Enhanced version with Supabase integration
export function LiveUtteranceStreamWithRealtime({
  conversationId,
  userId,
  ...props
}: LiveUtteranceStreamProps & { userId: string }) {
  const { utterances, isActive, addUtterance, setActiveState } = useLiveUtteranceStream(conversationId);
  
  // In a real implementation, this would use the useLiveConversationMonitor hook
  // to receive real-time utterance events and call addUtterance accordingly
  
  return (
    <LiveUtteranceStream
      {...props}
      conversationId={conversationId}
      isActive={isActive}
      utterances={utterances}
    />
  );
}