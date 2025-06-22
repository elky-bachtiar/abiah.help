import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cn } from '../../lib/utils'; 
import welcomeMp4 from '../../assets/videos/Abiah.mp4';
import welcomeWebm from '../../assets/videos/welcome.webm';

interface TavusVideoWelcomeProps {
  onVideoReady?: () => void;
  className?: string;
}

export function TavusVideoWelcome({ onVideoReady, className }: TavusVideoWelcomeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  

  const videoRef = useRef<HTMLVideoElement>(null);

  // Local video assets for Hero section
  const posterUrl = undefined; // Set to a local poster if available, otherwise undefined.

  useEffect(() => {
    setIsLoading(true);
    // Simulate a short loading delay for UX
    const timeout = setTimeout(() => {
      setIsLoading(false);
      onVideoReady?.();
    }, 800);
    return () => clearTimeout(timeout);
  }, [onVideoReady]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      // Auto-play the background video on load
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('aspect-video bg-gradient-to-br from-primary to-primary-800 rounded-xl flex items-center justify-center', className)}>
        <div className="text-center text-white">
          <LoadingSpinner size="lg" /> 
          <p className="mt-4 text-lg">Preparing your personalized welcome...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative aspect-video rounded-xl overflow-hidden group', className)}>
      {/* Background Video (Abiah webm) */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={posterUrl}
        muted={isMuted}
        loop
        playsInline
        onLoadedData={handleVideoLoad}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
 
        <source src={welcomeMp4} type="video/mp4" />
        <source src={welcomeWebm} type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Video Controls Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="video-control-btn"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleMuteToggle}
              className="video-control-btn"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>


        </div>
      </div>


    </div>
  );
}