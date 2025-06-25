import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface ConversationMonitorState {
  isActive: boolean;
  status: 'waiting' | 'in_progress' | 'completed' | 'error';
  userSpeaking: boolean;
  aiSpeaking: boolean;
  messageCount: number;
  toolCallsActive: number;
  perceptionActive: boolean;
  lastEvent: any;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

interface LiveConversationMonitorHook {
  state: ConversationMonitorState;
  startMonitoring: (conversationId: string, userId: string) => void;
  stopMonitoring: () => void;
  toggleMonitoring: () => void;
}

export function useLiveConversationMonitor(): LiveConversationMonitorHook {
  const [state, setState] = useState<ConversationMonitorState>({
    isActive: false,
    status: 'waiting',
    userSpeaking: false,
    aiSpeaking: false,
    messageCount: 0,
    toolCallsActive: 0,
    perceptionActive: false,
    lastEvent: null,
    connectionStatus: 'disconnected'
  });

  const [channel, setChannel] = useState<any>(null);
  const [monitoringConfig, setMonitoringConfig] = useState<{
    conversationId: string;
    userId: string;
  } | null>(null);

  const handleRealTimeEvent = useCallback((payload: any) => {
    const { type, data } = payload.payload;
    
    setState(prev => {
      const newState = { ...prev, lastEvent: { type, data, timestamp: Date.now() } };

      switch (type) {
        case 'conversation_started':
          return {
            ...newState,
            status: 'in_progress',
            isActive: true
          };

        case 'conversation_ended':
        case 'conversation_completed':
          return {
            ...newState,
            status: 'completed',
            userSpeaking: false,
            aiSpeaking: false,
            toolCallsActive: 0,
            perceptionActive: false
          };

        case 'utterance':
          return {
            ...newState,
            messageCount: prev.messageCount + 1
          };

        case 'speaking_state_change':
          if (data.speaker === 'user') {
            return {
              ...newState,
              userSpeaking: data.state === 'started'
            };
          } else if (data.speaker === 'replica') {
            return {
              ...newState,
              aiSpeaking: data.state === 'started'
            };
          }
          return newState;

        case 'tool_call':
          return {
            ...newState,
            toolCallsActive: prev.toolCallsActive + 1
          };

        case 'tool_call_completed':
          return {
            ...newState,
            toolCallsActive: Math.max(0, prev.toolCallsActive - 1)
          };

        case 'perception_tool_call':
        case 'perception_analysis':
          return {
            ...newState,
            perceptionActive: true
          };

        case 'recording_ready':
          // Handle recording ready notification
          return newState;

        case 'perception_analysis_complete':
          return {
            ...newState,
            perceptionActive: false
          };

        default:
          return newState;
      }
    });
  }, []);

  const startMonitoring = useCallback((conversationId: string, userId: string) => {
    console.log('Starting live conversation monitoring:', conversationId);
    
    // Stop existing monitoring if any
    if (channel) {
      channel.unsubscribe();
    }

    setState(prev => ({
      ...prev,
      connectionStatus: 'connecting',
      isActive: true
    }));

    // Create new channel for this conversation
    const newChannel = supabase
      .channel(`user-${userId}`)
      .on('broadcast', { event: 'conversation_update' }, handleRealTimeEvent)
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setState(prev => ({
          ...prev,
          connectionStatus: status === 'SUBSCRIBED' ? 'connected' : 'connecting'
        }));
      });

    setChannel(newChannel);
    setMonitoringConfig({ conversationId, userId });
  }, [channel, handleRealTimeEvent]);

  const stopMonitoring = useCallback(() => {
    console.log('Stopping live conversation monitoring');
    
    if (channel) {
      channel.unsubscribe();
      setChannel(null);
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      connectionStatus: 'disconnected'
    }));
    
    setMonitoringConfig(null);
  }, [channel]);

  const toggleMonitoring = useCallback(() => {
    if (state.isActive && monitoringConfig) {
      stopMonitoring();
    } else if (monitoringConfig) {
      startMonitoring(monitoringConfig.conversationId, monitoringConfig.userId);
    }
  }, [state.isActive, monitoringConfig, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [channel]);

  // Auto-reset perception active state after delay
  useEffect(() => {
    if (state.perceptionActive) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, perceptionActive: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.perceptionActive]);

  return {
    state,
    startMonitoring,
    stopMonitoring,
    toggleMonitoring
  };
}