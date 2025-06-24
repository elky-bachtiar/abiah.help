import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ConversationCompletionHookResult {
  isCompleted: boolean;
  transcript: any[] | null;
  completionTime: string | null;
  documentOpportunities: {
    pitch_deck: boolean;
    business_plan: boolean;
    market_analysis: boolean;
  };
  error: string | null;
}

export function useConversationCompletion(
  consultationId?: string,
  userId?: string
): ConversationCompletionHookResult {
  const [isCompleted, setIsCompleted] = useState(false);
  const [transcript, setTranscript] = useState<any[] | null>(null);
  const [completionTime, setCompletionTime] = useState<string | null>(null);
  const [documentOpportunities, setDocumentOpportunities] = useState({
    pitch_deck: false,
    business_plan: false,
    market_analysis: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // Check if conversation is already completed
  useEffect(() => {
    if (!consultationId) return;
    
    const checkConversationStatus = async () => {
      try {
        // Check conversation status
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .select('status, has_transcript, updated_at')
          .eq('id', consultationId)
          .single();
        
        if (conversationError) throw conversationError;
        
        if (conversation.status === 'completed' && conversation.has_transcript) {
          setIsCompleted(true);
          setCompletionTime(conversation.updated_at);
          
          // Get transcript
          const { data: transcriptData, error: transcriptError } = await supabase
            .from('conversation_transcripts')
            .select('transcript')
            .eq('consultation_id', consultationId)
            .single();
          
          if (transcriptError) throw transcriptError;
          
          if (transcriptData) {
            setTranscript(transcriptData.transcript);
          }
          
          // Check for document opportunities
          const { data: opportunities, error: opportunitiesError } = await supabase
            .from('document_generation_opportunities')
            .select('suggested_documents')
            .eq('consultation_id', consultationId)
            .single();
          
          if (!opportunitiesError && opportunities) {
            setDocumentOpportunities({
              pitch_deck: opportunities.suggested_documents.pitch_deck || false,
              business_plan: opportunities.suggested_documents.business_plan || false,
              market_analysis: opportunities.suggested_documents.market_analysis || false
            });
          }
        }
      } catch (err) {
        console.error('Error checking conversation status:', err);
        setError(err instanceof Error ? err.message : 'Failed to check conversation status');
      }
    };
    
    checkConversationStatus();
  }, [consultationId]);
  
  // Subscribe to conversation completion events
  useEffect(() => {
    if (!consultationId || !userId) return;
    
    const channel = supabase
      .channel(`user-${userId}`)
      .on(
        'broadcast',
        { event: 'conversation_completed' },
        (payload) => {
          console.log('Conversation completed event received:', payload);
          
          if (payload.payload.consultationId === consultationId) {
            setIsCompleted(true);
            setCompletionTime(payload.payload.completedAt);
            setTranscript(payload.payload.transcript);
            
            if (payload.payload.documentOpportunities) {
              setDocumentOpportunities({
                pitch_deck: payload.payload.documentOpportunities.pitch_deck || false,
                business_plan: payload.payload.documentOpportunities.business_plan || false,
                market_analysis: payload.payload.documentOpportunities.market_analysis || false
              });
            }
            
            // Show success notification
            toast.success('Conversation completed! Transcript saved.');
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultationId, userId]);
  
  return {
    isCompleted,
    transcript,
    completionTime,
    documentOpportunities,
    error
  };
}