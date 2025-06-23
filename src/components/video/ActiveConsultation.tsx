import React, { useEffect, useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { useDaily, useLocalSessionId, useParticipantIds, useVideoTrack, useAudioTrack } from '@daily-co/daily-react';
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
import { VideoControls } from './VideoControls';
import { SessionTimer } from './SessionTimer';

// Custom hook: always call the same number of hooks
function useRemoteVideoTracks(remoteParticipantIds, maxParticipants = 8) {
  // Always call the same number of hooks, up to maxParticipants
  const tracks = [];
  for (let i = 0; i < maxParticipants; i++) {
    const pid = remoteParticipantIds[i];
    tracks.push({
      pid,
      videoTrack: useVideoTrack(pid),
    });
  }
  return tracks.filter(t => t.pid); // Only return those with a participant
}

export function ActiveConsultation() {
  const [consultationContext] = useAtom(consultationContextAtom);
  const [, setCurrentScreen] = useAtom(conversationScreenAtom);
  const [videoControls, setVideoControls] = useAtom(videoControlsAtom);
  const [sessionTimer, setSessionTimer] = useAtom(sessionTimerAtom);
  const [activeConversationId, setActiveConversationId] = useAtom(activeConversationIdAtom);
  const [user] = useAtom(userAtom);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [tavusConversationId, setTavusConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Daily hooks
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);

  // SAFELY get remote video tracks
  const remoteVideos = useRemoteVideoTracks(remoteParticipantIds);

  useEffect(() => {
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
          startAudioOff: true,
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

  const handleEndConsultation = useCallback(() => {
    // End the Tavus conversation
    if (tavusConversationId) {
      endConversation('', tavusConversationId, activeConversationId || undefined)
        .catch(error => console.error('Error ending conversation:', error));
    }
    
    // Leave the Daily call
    daily?.leave();
    
    // Navigate to summary screen
    setCurrentScreen('summary');
  }, [daily, setCurrentScreen, tavusConversationId, activeConversationId]);

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
      <div>
        {/* Render local video */}
        {localSessionId && (
          <video
            autoPlay
            muted
            playsInline
            ref={videoEl => {
              if (videoEl && localVideo?.track) {
                videoEl.srcObject = new MediaStream([localVideo.track]);
              }
            }}
            style={{ width: 320, height: 240, background: '#111' }}
          />
        )}
        {/* Render remote videos */}
        {remoteVideos.map(({ pid, videoTrack }) => (
          <video
            key={pid}
            autoPlay
            playsInline
            ref={videoEl => {
              if (videoEl && videoTrack?.track) {
                videoEl.srcObject = new MediaStream([videoTrack.track]);
              }
            }}
            style={{ width: 320, height: 240, background: '#111' }}
          />
        ))}
      </div>
      <VideoControls
        onToggleCamera={toggleCamera}
        onToggleMic={toggleMic}
        onEndCall={handleEndConsultation}
      />
    </div>
  );
}