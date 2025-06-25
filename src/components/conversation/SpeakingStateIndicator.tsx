import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, User, Bot } from 'lucide-react';

interface SpeakingStateIndicatorProps {
  userSpeaking: boolean;
  aiSpeaking: boolean;
  variant?: 'compact' | 'detailed' | 'minimal';
  showLabels?: boolean;
  className?: string;
}

export function SpeakingStateIndicator({
  userSpeaking,
  aiSpeaking,
  variant = 'compact',
  showLabels = true,
  className = ''
}: SpeakingStateIndicatorProps) {
  
  const renderMinimal = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center ${userSpeaking ? 'text-success' : 'text-neutral-400'}`}>
        {userSpeaking ? (
          <Mic className="w-4 h-4 animate-pulse" />
        ) : (
          <MicOff className="w-4 h-4" />
        )}
      </div>
      
      <div className="w-px h-4 bg-neutral-300" />
      
      <div className={`flex items-center ${aiSpeaking ? 'text-secondary' : 'text-neutral-400'}`}>
        {aiSpeaking ? (
          <Volume2 className="w-4 h-4 animate-pulse" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </div>
    </div>
  );

  const renderCompact = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors ${
        userSpeaking 
          ? 'bg-success/10 text-success' 
          : 'bg-neutral-100 text-neutral-500'
      }`}>
        <User className="w-3 h-3" />
        {userSpeaking ? (
          <Mic className="w-3 h-3 animate-pulse" />
        ) : (
          <MicOff className="w-3 h-3" />
        )}
        {showLabels && (
          <span className="hidden sm:inline">
            {userSpeaking ? 'Speaking' : 'Listening'}
          </span>
        )}
      </div>
      
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors ${
        aiSpeaking 
          ? 'bg-secondary/10 text-secondary' 
          : 'bg-neutral-100 text-neutral-500'
      }`}>
        <Bot className="w-3 h-3" />
        {aiSpeaking ? (
          <Volume2 className="w-3 h-3 animate-pulse" />
        ) : (
          <VolumeX className="w-3 h-3" />
        )}
        {showLabels && (
          <span className="hidden sm:inline">
            {aiSpeaking ? 'Speaking' : 'Listening'}
          </span>
        )}
      </div>
    </div>
  );

  const renderDetailed = () => (
    <div className={`space-y-2 ${className}`}>
      <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        userSpeaking 
          ? 'bg-success/10 border border-success/20' 
          : 'bg-neutral-50 border border-neutral-200'
      }`}>
        <div className="flex items-center gap-2">
          <User className={`w-4 h-4 ${userSpeaking ? 'text-success' : 'text-neutral-500'}`} />
          <span className={`text-sm font-medium ${userSpeaking ? 'text-success' : 'text-neutral-700'}`}>
            You
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs ${userSpeaking ? 'text-success' : 'text-neutral-500'}`}>
            {userSpeaking ? 'Speaking' : 'Listening'}
          </span>
          {userSpeaking ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Mic className="w-4 h-4 text-success" />
            </motion.div>
          ) : (
            <MicOff className="w-4 h-4 text-neutral-400" />
          )}
        </div>
      </div>
      
      <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        aiSpeaking 
          ? 'bg-secondary/10 border border-secondary/20' 
          : 'bg-neutral-50 border border-neutral-200'
      }`}>
        <div className="flex items-center gap-2">
          <Bot className={`w-4 h-4 ${aiSpeaking ? 'text-secondary' : 'text-neutral-500'}`} />
          <span className={`text-sm font-medium ${aiSpeaking ? 'text-secondary' : 'text-neutral-700'}`}>
            AI Assistant
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs ${aiSpeaking ? 'text-secondary' : 'text-neutral-500'}`}>
            {aiSpeaking ? 'Speaking' : 'Listening'}
          </span>
          {aiSpeaking ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Volume2 className="w-4 h-4 text-secondary" />
            </motion.div>
          ) : (
            <VolumeX className="w-4 h-4 text-neutral-400" />
          )}
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'minimal':
      return renderMinimal();
    case 'detailed':
      return renderDetailed();
    case 'compact':
    default:
      return renderCompact();
  }
}

// Animated pulse indicator for when someone is speaking
export function SpeakingPulse({ 
  isActive, 
  color = 'success',
  size = 'sm' 
}: { 
  isActive: boolean; 
  color?: 'success' | 'secondary' | 'primary';
  size?: 'xs' | 'sm' | 'md';
}) {
  const colorClasses = {
    success: 'bg-success',
    secondary: 'bg-secondary', 
    primary: 'bg-primary'
  };

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`rounded-full ${colorClasses[color]} ${sizeClasses[size]}`}
          animate={isActive ? {
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8]
          } : {
            opacity: 0.3,
            scale: 0.8
          }}
          transition={{
            duration: 1,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}