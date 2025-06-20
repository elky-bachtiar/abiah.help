import React from 'react';
import { useAtom } from 'jotai';
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Settings, MoreHorizontal } from 'lucide-react';
import { videoControlsAtom } from '../../store/consultation'; 

interface VideoControlsProps {
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onEndCall: () => void;
}

export function VideoControls({ onToggleCamera, onToggleMic, onEndCall }: VideoControlsProps) {
  const [videoControls] = useAtom(videoControlsAtom);

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <div className="flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera} 
          className={`video-control-btn ${videoControls.isCameraOn ? 'bg-white/20' : 'bg-red-500'}`}
          aria-label={videoControls.isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {videoControls.isCameraOn ? (
            <Camera className="w-5 h-5" />
          ) : (
            <CameraOff className="w-5 h-5" />
          )}
        </button>

        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`video-control-btn ${videoControls.isMicOn ? 'bg-white/20' : 'bg-red-500'}`}
          aria-label={videoControls.isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {videoControls.isMicOn ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </button>

        {/* Settings */}
        <button
          className="video-control-btn"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* More Options */}
        <button
          className="video-control-btn"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {/* End Call */}
        <button
          onClick={onEndCall}
          className="video-control-btn bg-red-500 hover:bg-red-600"
          aria-label="End consultation"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}