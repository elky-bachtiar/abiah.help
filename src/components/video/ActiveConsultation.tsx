import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import {
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
  DailyAudio,
} from '@daily-co/daily-react';
import { 
  conversationScreenAtom, 
  videoControlsAtom, 
  sessionTimerAtom, 
  consultationContextAtom,
  activeConversationIdAtom
} from '../../store/consultation';
import { createConversation } from '../../api/createConversation';
import { endConversation } from '../../api/endConversation';
import { appendMessageToHistory } from '../../api/conversationApi';
import { userAtom } from '../../store/auth';
import { Button } from '../ui/Button-bkp';
import { supabase } from '../../lib/supabase';
import { VideoControls } from './VideoControls';
import { SessionTimer } from './SessionTimer';

// Custom hook: always call the same number of hooks
function useRemoteVideoTracks(remoteParticipantIds, maxParticipants = 8) {
  // Slice the array to ensure we don't exceed maxParticipants
  const participantIds = remoteParticipantIds.slice(0, maxParticipants);
  
  // Call hooks at the component level - fixed number of calls regardless of input
  const videoTrack0 = useVideoTrack(participantIds[0]);
  const videoTrack1 = useVideoTrack(participantIds[1]);
  const videoTrack2 = useVideoTrack(participantIds[2]);
  const videoTrack3 = useVideoTrack(participantIds[3]);
  const videoTrack4 = useVideoTrack(participantIds[4]);
  const videoTrack5 = useVideoTrack(participantIds[5]);
  const videoTrack6 = useVideoTrack(participantIds[6]);
  const videoTrack7 = useVideoTrack(participantIds[7]);
  
  // Combine the tracks with their participant IDs
  const tracks = [
    { pid: participantIds[0], videoTrack: videoTrack0 },
    { pid: participantIds[1], videoTrack: videoTrack1 },
    { pid: participantIds[2], videoTrack: videoTrack2 },
    { pid: participantIds[3], videoTrack: videoTrack3 },
    { pid: participantIds[4], videoTrack: videoTrack4 },
    { pid: participantIds[5], videoTrack: videoTrack5 },
    { pid: participantIds[6], videoTrack: videoTrack6 },
    { pid: participantIds[7], videoTrack: videoTrack7 },
  ];
  
  return tracks.filter(t => t.pid); // Only return those with a participant
}

export function ActiveConsultation() {
  const [consultationContext] = useAtom(consultationContextAtom);
  const [, setCurrentScreen] = useAtom(conversationScreenAtom);
  const [activeConversationId, setActiveConversationId] = useAtom(activeConversationIdAtom);
  const [videoControls, setVideoControls] = useAtom(videoControlsAtom);
  const [sessionTimer, setSessionTimer] = useAtom(sessionTimerAtom);
  const [user] = useAtom(userAtom);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [tavusConversationId, setTavusConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializedRef = useRef(false);
  const endingConversationRef = useRef(false);
  const navigate = useNavigate();

  // Daily hooks
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);

  // Get remote video and audio tracks
  const remoteVideos = useRemoteVideoTracks(remoteParticipantIds);
  // No longer need custom audio tracks, DailyAudio handles it automatically



  useEffect(() => {
    // Prevent duplicate initialization
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    setConversationUrl(null);
    setSessionTimer(prev => ({
      ...prev,
      startTime: new Date(),
      duration: 0,
      remainingTime: 1800,
      isActive: false,
    }));

    const initializeConsultation = async () => {
      try {
        // Early exit if we already have a Tavus conversation ID
        if (tavusConversationId) {
          console.log('Conversation already initialized with ID:', tavusConversationId);
          return;
        }
        
        setIsLoading(true);
        
        // Create Tavus conversation with context from settings screen
        const conversation = await createConversation(
          user?.id, // Pass user ID if available
          `Consultation on ${new Date().toLocaleDateString()}` // Default title
        );
        
        setConversationUrl(conversation.conversation_url);
        setTavusConversationId(conversation.conversation_id);
        
        // If we have a user and no active conversation ID was set (new conversation),
        // we'll use the one created in createConversation
        if (user && !activeConversationId) {
          // The local conversation ID is stored in the database and linked to the Tavus ID
          // We don't need to do anything here as it's handled in createConversation
        }

        // Join the Daily call
        await daily?.join({
          url: conversation.conversation_url,
          startVideoOff: false, 
          startAudioOff: false,
        });

        setSessionTimer(prev => ({
          ...prev,
          startTime: new Date(),
          isActive: true,
        }));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize consultation:', error);
        setCurrentScreen('error'); 
      }
    };

    initializeConsultation();
  }, [setCurrentScreen, setSessionTimer, consultationContext, daily]);

  // Handle message recording
  const recordMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!user || !activeConversationId) return;
    
    try {
      await appendMessageToHistory(activeConversationId, {
        id: `msg-${Date.now()}`,
        role,
        content,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error recording message:', error);
      // Continue even if recording fails
    }
  }, [user, activeConversationId]);

  // Video/mic controls
  const toggleCamera = useCallback(() => {
    daily?.setLocalVideo(!localVideo || localVideo.isOff);
    setVideoControls(prev => ({ ...prev, isCameraOn: !prev.isCameraOn }));
  }, [daily, localVideo, setVideoControls]);

  const toggleMic = useCallback(() => {
    daily?.setLocalAudio(!localAudio || localAudio.isOff);
    setVideoControls(prev => ({ ...prev, isMicOn: !prev.isMicOn }));
  }, [daily, localAudio, setVideoControls]);
  
  // Navigate to conversation history
  const goToConversationHistory = useCallback(() => {
    navigate('/conversation-history');
  }, [navigate]);

  const handleEndConsultation = useCallback(() => {
    // Prevent multiple end calls
    if (endingConversationRef.current) {
      console.log('Already ending conversation, ignoring duplicate request');
      return;
    }
    
    endingConversationRef.current = true;
    console.log('Ending consultation with Tavus ID:', tavusConversationId, 'Local ID:', activeConversationId);
    
    // End the Tavus conversation
    if (tavusConversationId) {
      endConversation('', tavusConversationId, activeConversationId || undefined)
        .then(() => {
          console.log('Successfully ended conversation');
          // Navigate to summary screen
          setCurrentScreen('summary');
        })
        .catch(error => {
          console.error('Error ending conversation:', error);
          // Still navigate to summary screen even if there's an error
          setCurrentScreen('summary');
        })
        .finally(() => {
          endingConversationRef.current = false;
        });
    } else {
      console.warn('No Tavus conversation ID available, cannot end conversation properly');
      setCurrentScreen('summary');
      endingConversationRef.current = false;
    }
    
    // Leave the Daily call
    daily?.leave();
  }, [daily, setCurrentScreen, tavusConversationId, activeConversationId]);
  
  // Set up event listener for beforeunload to end conversation when page is closed
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (tavusConversationId && !endingConversationRef.current) {
        // Try to end the conversation
        endingConversationRef.current = true;
        endConversation('', tavusConversationId, activeConversationId || undefined)
          .catch(error => console.error('Error ending conversation on page unload:', error));
      }
      
      // Standard beforeunload handling
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tavusConversationId, activeConversationId]);



  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-secondary rounded-full mx-auto mb-4" /> 
          <h2 className="text-2xl font-bold text-white mb-2">Connecting to your AI mentor...</h2>
          <p className="text-white/70">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SessionTimer />
      
      {/* Conversation History Link */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={goToConversationHistory}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-600 rounded-lg transition-colors">
          View Conversation History
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Render local video */}
        {localSessionId && (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg border-2 border-white/20">
            <video
              autoPlay
              muted
              playsInline
              ref={videoEl => {
                if (videoEl && localVideo?.track) {
                  videoEl.srcObject = new MediaStream([localVideo.track]);
                }
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              You
            </div>
          </div>
        )}
        {/* Render remote videos */}
        {remoteVideos.map(({ pid, videoTrack }) => (
          <div key={pid} className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg border-2 border-white/20">
            <video
              autoPlay
              playsInline
              ref={videoEl => {
                if (videoEl && videoTrack?.track) {
                  videoEl.srcObject = new MediaStream([videoTrack.track]);
                }
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              AI Mentor
            </div>
          </div>
        ))}
        
        {/* Use the official DailyAudio component to handle audio automatically */}
        <DailyAudio />
      </div>
      <VideoControls
        onToggleCamera={toggleCamera}
        onToggleMic={toggleMic}
        onEndCall={handleEndConsultation}
      />
    </div>
  );
}

// We no longer need the custom audio hooks since we're using DailyAudio component