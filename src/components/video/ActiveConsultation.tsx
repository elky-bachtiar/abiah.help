import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Mic, MicOff, PhoneOff, MessageSquare } from 'lucide-react';
import { conversationScreenAtom, videoControlsAtom, sessionTimerAtom } from '../../store/consultation';
import { tavusAPI, callTavusAPI } from '../../api/tavus';

// Local function to create a conversation
async function createConversation(data: any) {
  return callTavusAPI({ method: 'POST', endpoint: '/conversations', data });
}
import { Button } from '../ui/Button';
import { VideoControls } from './VideoControls';
import { SessionTimer } from './SessionTimer';

export function ActiveConsultation() {
  const [, setCurrentScreen] = useAtom(conversationScreenAtom);
  const [videoControls, setVideoControls] = useAtom(videoControlsAtom);
  const [sessionTimer, setSessionTimer] = useAtom(sessionTimerAtom);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeConsultation = async () => {
      try {
        setIsLoading(true);
        
        // Create Tavus conversation
        const conversation = await createConversation({
          persona_id: 'general_mentor',
          greeting: 'Hello! I\'m Abiah, your AI startup mentor. I\'m here to help you navigate the funding landscape and accelerate your startup\'s growth. What would you like to focus on today?',
          context: 'This is a startup mentorship consultation focused on funding and growth strategies.',
        });
        
        setConversationUrl(conversation.conversation_url);
        
        // Start session timer
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
  }, [setCurrentScreen, setSessionTimer]);

  const handleEndConsultation = () => {
    setSessionTimer(prev => ({ ...prev, isActive: false }));
    setCurrentScreen('summary');
  };

  const toggleCamera = () => {
    setVideoControls(prev => ({ ...prev, isCameraOn: !prev.isCameraOn }));
  };

  const toggleMic = () => {
    setVideoControls(prev => ({ ...prev, isMicOn: !prev.isMicOn }));
  };

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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">AI Consultation Session</h1>
          <p className="text-white/70">Connected with Abiah, your startup mentor</p>
        </div>
        
        <SessionTimer />
      </motion.div>

      {/* Video Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative bg-black rounded-2xl overflow-hidden mb-6"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Main Video Area */}
        <div className="absolute inset-0">
          {conversationUrl ? (
            <iframe
              src={conversationUrl}
              className="w-full h-full"
              allow="camera; microphone; fullscreen"
              title="AI Consultation"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary-800 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">AI</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Abiah - AI Startup Mentor</h3>
                <p className="text-white/80">Ready to help you succeed</p>
              </div>
            </div>
          )}
        </div>

        {/* User Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
          {videoControls.isCameraOn ? (
            <div className="w-full h-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center text-white">
              <Camera className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white">
              <CameraOff className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Video Controls Overlay */}
        <VideoControls
          onToggleCamera={toggleCamera}
          onToggleMic={toggleMic}
          onEndCall={handleEndConsultation}
        />
      </motion.div>

      {/* Chat/Notes Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Quick Actions
          </h3>
          
          <div className="space-y-3">
            <Button variant="outline" size="sm" className="w-full border-white text-white hover:bg-white hover:text-primary">
              Share Screen
            </Button>
            <Button variant="outline" size="sm" className="w-full border-white text-white hover:bg-white hover:text-primary">
              Upload Document
            </Button>
            <Button variant="outline" size="sm" className="w-full border-white text-white hover:bg-white hover:text-primary">
              Take Notes
            </Button>
          </div>
        </div>

        {/* Session Info */}
        <div className="md:col-span-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Session Focus</h3>
          
          <div className="space-y-3 text-white/80">
            <div className="flex items-center justify-between">
              <span>Consultation Type:</span>
              <span className="text-secondary font-medium">General Mentorship</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Session Duration:</span>
              <span className="text-secondary font-medium">30 minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recording:</span>
              <span className="text-green-400 font-medium">Enabled</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-white/70 text-sm">
              💡 <strong>Tip:</strong> Ask specific questions about your pitch deck, business model, 
              or funding strategy to get the most valuable insights.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}