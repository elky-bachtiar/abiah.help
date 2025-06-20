import React, { useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Camera, Mic, Settings, ArrowRight, AlertCircle } from 'lucide-react';
import { conversationScreenAtom, videoControlsAtom, consultationContextAtom } from '../../store/consultation';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

export function SettingsScreen() {
  const [, setCurrentScreen] = useAtom(conversationScreenAtom);
  const [videoControls, setVideoControls] = useAtom(videoControlsAtom);
  const [focusArea, setFocusArea] = useState('');
  const [specificQuestions, setSpecificQuestions] = useState('');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const setConsultationContext = useSetAtom(consultationContextAtom);

  const handleDeviceCheck = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Stop the stream after getting permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionsGranted(true);
    } catch (error) {
      console.error('Media access denied:', error);
      alert('Please allow camera and microphone access to continue.');
    }
  };

  const handleStartConsultation = () => {
    if (!permissionsGranted) {
      alert('Please test your camera and microphone first.');
      return;
    }
    
    // Save context data here if needed
    // Use a friendly default greeting if focusArea looks like a topic (e.g., 'pitch-deck')
    const isLikelyTopic = (text: string) => {
      if (!text) return true;
      // If it's very short or one/two words, or matches common topic keywords
      const topicKeywords = ['pitch-deck', 'funding', 'growth', 'marketing', 'sales', 'product'];
      const words = text.trim().split(/\s+/);
      if (words.length <= 2) return true;
      if (topicKeywords.some(keyword => text.toLowerCase().includes(keyword))) return true;
      // If it doesn't end with punctuation or is not a sentence
      if (!/[.!?]$/.test(text.trim())) return true;
      return false;
    };
    setConsultationContext({
      custom_greeting: isLikelyTopic(focusArea)
        ? "Hello! I'm Abiah, your AI startup mentor. I'm here to help you navigate the funding landscape and accelerate your startup's growth. What would you like to focus on today?"
        : focusArea,
      conversational_context: specificQuestions || 'This is a startup mentorship consultation focused on funding and growth strategies.'
    });
    setCurrentScreen('conversation');
  };

  const toggleCamera = () => {
    setVideoControls(prev => ({ ...prev, isCameraOn: !prev.isCameraOn }));
  };

  const toggleMic = () => {
    setVideoControls(prev => ({ ...prev, isMicOn: !prev.isMicOn }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Let's Set Up Your Consultation
        </h1>
        
        <p className="text-white/70 text-lg">
          A few quick settings to ensure the best experience
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Device Setup */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Device Setup
            </h3>
            
            {/* Device Test */}
            <div className="space-y-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Camera</span>
                  <button
                    onClick={toggleCamera}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      videoControls.isCameraOn ? 'bg-green-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      videoControls.isCameraOn ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Microphone</span>
                  <button
                    onClick={toggleMic}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      videoControls.isMicOn ? 'bg-green-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      videoControls.isMicOn ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              <Button
                onClick={handleDeviceCheck}
                variant="outline"
                className="w-full border-white text-white hover:bg-white hover:text-primary"
              >
                <Camera className="w-4 h-4 mr-2" />
                Test Camera & Microphone
              </Button>

              {permissionsGranted && (
                <div className="flex items-center text-green-300 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Device permissions granted!
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Consultation Context */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              Consultation Focus
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Primary Focus Area (Optional)
                </label>
                <select
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="" className="bg-primary text-white">Select a focus area</option>
                  <option value="pitch-deck" className="bg-primary text-white">Pitch Deck Review</option>
                  <option value="business-model" className="bg-primary text-white">Business Model</option>
                  <option value="financial-projections" className="bg-primary text-white">Financial Projections</option>
                  <option value="market-strategy" className="bg-primary text-white">Market Strategy</option>
                  <option value="competitive-analysis" className="bg-primary text-white">Competitive Analysis</option>
                  <option value="fundraising-strategy" className="bg-primary text-white">Fundraising Strategy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Specific Questions (Optional)
                </label>
                <textarea
                  value={specificQuestions}
                  onChange={(e) => setSpecificQuestions(e.target.value)}
                  placeholder="What specific challenges would you like to discuss? e.g., 'How do I improve my unit economics?' or 'What should I include in my Series A pitch?'"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus: ring-secondary h-24 resize-none"
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-3">🎯 Quick Tips</h3>
        <div className="grid md:grid-cols-3 gap-4 text-white/80 text-sm">
          <div>
            <strong>Be Specific:</strong> The more context you provide, the better tailored advice you'll receive.
          </div>
          <div>
            <strong>Have Materials Ready:</strong> Keep your pitch deck, business plan, or financial data accessible.
          </div>
          <div>
            <strong>Take Notes:</strong> You'll receive a summary, but jotting down key insights helps retention.
          </div>
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-center mt-8"
      >
        <Button
          size="lg"
          variant="secondary"
          onClick={handleStartConsultation}
          disabled={!permissionsGranted}
          className="group"
        >
          Begin Consultation
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        {!permissionsGranted && (
          <p className="text-white/60 text-sm mt-2">
            Please test your camera and microphone first
          </p>
        )}
      </motion.div>
    </div>
  );
}