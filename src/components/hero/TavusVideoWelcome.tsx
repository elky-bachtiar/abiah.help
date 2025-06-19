import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { getVideoDev } from '../../api/tavus';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cn } from '../../lib/utils';

interface TavusVideoWelcomeProps {
  userName?: string;
  onVideoReady?: () => void;
  className?: string;
}

export function TavusVideoWelcome({ userName, onVideoReady, className }: TavusVideoWelcomeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Background video URL (Abiah webm)
  const backgroundVideoUrl = 'https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f/67b5222642c2133d9163ce80_newmike-transcode.webm';
  const posterUrl = 'https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-poster-00001.jpg';

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setIsLoading(true);
        
        // Load Tavus video data
        const data = await getVideoDev('e990cb0d94');
        setVideoData(data);
        
        // Simulate loading delay for better UX
        setTimeout(() => {
          setIsLoading(false);
          onVideoReady?.();
        }, 1500);
      } catch (err) {
        console.error('Error loading video:', err);
        setError('Failed to load video');
        setIsLoading(false);
      }
    };

    loadVideo();
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

  if (error) {
    return (
      <div className={cn('aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl flex items-center justify-center', className)}>
        <div className="text-center text-text-secondary">
          <div className="w-16 h-16 bg-neutral-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium">Video Preview</p>
          <p className="text-sm mt-2">Unable to load personalized video</p>
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
        <source src={backgroundVideoUrl} type="video/webm" />
        <source 
          src="https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f/67b5222642c2133d9163ce80_newmike-transcode.mp4" 
          type="video/mp4" 
        />
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

          <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
            {userName ? `Welcome back, ${userName}!` : 'Meet Abiah, your AI mentor'}
          </div>
        </div>
      </div>

      {/* Greeting Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <div className="text-white text-center">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
            <p className="text-lg font-medium">
              {userName ? `Hi ${userName}! Ready to accelerate your startup?` : 'Welcome to Abiah.help'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}