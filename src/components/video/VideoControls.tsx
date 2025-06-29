import React from 'react';
import { useAtom } from 'jotai';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Settings, 
  MoreHorizontal,
  Monitor,
  MonitorOff
} from 'lucide-react';
import { videoControlsAtom } from '../../store/consultation';
import { motion } from 'framer-motion';

interface VideoControlsProps {
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onEndCall: () => void;
  onToggleScreenShare?: () => void;
  onOpenSettings?: () => void;
  onMoreOptions?: () => void;
  disabled?: boolean;
}

export function VideoControls({ 
  onToggleCamera, 
  onToggleMic, 
  onEndCall,
  onToggleScreenShare,
  onOpenSettings,
  onMoreOptions,
  disabled = false
}: VideoControlsProps) {
  const [videoControls] = useAtom(videoControlsAtom);

  const controlButtonClass = (isActive: boolean, isDestructive = false) => `
    relative w-12 h-12 rounded-full flex items-center justify-center text-white
    transition-all duration-200 ease-in-out transform
    hover:scale-105 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-white/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    ${isDestructive 
      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' 
      : isActive 
      ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm' 
      : 'bg-red-500/80 hover:bg-red-500'
    }
  `;

  const secondaryButtonClass = `
    relative w-12 h-12 rounded-full flex items-center justify-center text-white
    bg-white/10 hover:bg-white/20 backdrop-blur-sm
    transition-all duration-200 ease-in-out transform
    hover:scale-105 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-white/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `;

  return (
    <motion.div 
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-2xl">
        {/* Camera Toggle */}
        <motion.button
          onClick={onToggleCamera}
          disabled={disabled}
          className={controlButtonClass(videoControls.isCameraOn)}
          aria-label={videoControls.isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          {videoControls.isCameraOn ? (
            <Camera className="w-5 h-5" />
          ) : (
            <CameraOff className="w-5 h-5" />
          )}
          
          {/* Status indicator */}
          <div className={`
            absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black/80
            ${videoControls.isCameraOn ? 'bg-green-400' : 'bg-red-400'}
          `} />
        </motion.button>

        {/* Microphone Toggle */}
        <motion.button
          onClick={onToggleMic}
          disabled={disabled}
          className={controlButtonClass(videoControls.isMicOn)}
          aria-label={videoControls.isMicOn ? 'Mute microphone' : 'Unmute microphone'}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          {videoControls.isMicOn ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
          
          {/* Status indicator */}
          <div className={`
            absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black/80
            ${videoControls.isMicOn ? 'bg-green-400' : 'bg-red-400'}
          `} />
        </motion.button>

        {/* Screen Share (if available) */}
        {onToggleScreenShare && (
          <motion.button
            onClick={onToggleScreenShare}
            disabled={disabled}
            className={controlButtonClass(videoControls.isScreenSharing || false)}
            aria-label={videoControls.isScreenSharing ? 'Stop screen share' : 'Start screen share'}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
          >
            {videoControls.isScreenSharing ? (
              <Monitor className="w-5 h-5" />
            ) : (
              <MonitorOff className="w-5 h-5" />
            )}
          </motion.button>
        )}

        {/* Divider */}
        <div className="h-8 w-px bg-white/20 mx-1" />

        {/* Settings */}
        <motion.button
          onClick={onOpenSettings}
          disabled={disabled}
          className={secondaryButtonClass}
          aria-label="Settings"
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        {/* More Options */}
        <motion.button
          onClick={onMoreOptions}
          disabled={disabled}
          className={secondaryButtonClass}
          aria-label="More options"
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>

        {/* End Call */}
        <motion.button
          onClick={onEndCall}
          disabled={disabled}
          className={controlButtonClass(false, true)}
          aria-label="End consultation"
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          <PhoneOff className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* Call duration or status */}
      <motion.div 
        className="text-center mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-white/60 text-xs">
          {disabled ? 'Call ended' : 'Consultation active'}
        </div>
      </motion.div>
    </motion.div>
  );
}