import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Share2, X, Maximize2, Minimize2, List } from 'lucide-react';
import { PitchDeckContent, PitchDeckSlide } from '../../types/Documents';
import { Button } from '../ui/Button-bkp';

interface PitchDeckRendererProps {
  content: PitchDeckContent;
  title: string;
  onClose?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function PitchDeckRenderer({
  content,
  title,
  onClose,
  onDownload,
  onShare
}: PitchDeckRendererProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);

  const slides = content.slides || [];
  const currentSlide = slides[currentSlideIndex];
  
  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  const toggleThumbnails = () => {
    setShowThumbnails(!showThumbnails);
  };
  
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlideIndex, isFullscreen]);
  
  // Get slide background color based on type
  const getSlideBackground = (slide: PitchDeckSlide) => {
    switch (slide.type) {
      case 'title':
        return 'bg-gradient-to-br from-primary to-primary-800 text-white';
      case 'problem':
        return 'bg-gradient-to-br from-red-500 to-red-700 text-white';
      case 'solution':
        return 'bg-gradient-to-br from-green-500 to-green-700 text-white';
      case 'market':
        return 'bg-gradient-to-br from-blue-500 to-blue-700 text-white';
      case 'business_model':
        return 'bg-gradient-to-br from-purple-500 to-purple-700 text-white';
      case 'traction':
        return 'bg-gradient-to-br from-orange-500 to-orange-700 text-white';
      case 'team':
        return 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white';
      case 'competition':
        return 'bg-gradient-to-br from-pink-500 to-pink-700 text-white';
      case 'financials':
        return 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white';
      case 'ask':
        return 'bg-gradient-to-br from-amber-500 to-amber-700 text-white';
      case 'contact':
        return 'bg-gradient-to-br from-primary to-primary-800 text-white';
      default:
        return 'bg-white';
    }
  };
  
  return (
    <div className={`pitch-deck-renderer ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
      {/* Controls */}
      <div className={`absolute top-4 right-4 z-10 flex items-center gap-2 ${isFullscreen ? 'text-white' : ''}`}>
        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className={isFullscreen ? 'border-white text-white hover:bg-white/20' : ''}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
        
        {onShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className={isFullscreen ? 'border-white text-white hover:bg-white/20' : ''}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
        
        <button
          onClick={toggleThumbnails}
          className={`p-2 rounded-lg transition-colors ${
            isFullscreen 
              ? 'text-white hover:bg-white/20' 
              : 'hover:bg-neutral-100'
          }`}
          title={showThumbnails ? 'Hide thumbnails' : 'Show thumbnails'}
        >
          <List className="w-5 h-5" />
        </button>
        
        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-lg transition-colors ${
            isFullscreen 
              ? 'text-white hover:bg-white/20' 
              : 'hover:bg-neutral-100'
          }`}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
        
        {onClose && (
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isFullscreen 
                ? 'text-white hover:bg-white/20' 
                : 'hover:bg-neutral-100'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Slide Counter */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1 rounded-full ${
        isFullscreen 
          ? 'bg-white/20 text-white' 
          : 'bg-neutral-800 text-white'
      }`}>
        {currentSlideIndex + 1} / {slides.length}
      </div>
      
      {/* Navigation Arrows */}
      <button
        onClick={goToPrevSlide}
        disabled={currentSlideIndex === 0}
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full transition-colors ${
          isFullscreen 
            ? 'bg-white/20 text-white hover:bg-white/30 disabled:opacity-30 disabled:bg-white/10' 
            : 'bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-30 disabled:bg-neutral-400'
        }`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={goToNextSlide}
        disabled={currentSlideIndex === slides.length - 1}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full transition-colors ${
          isFullscreen 
            ? 'bg-white/20 text-white hover:bg-white/30 disabled:opacity-30 disabled:bg-white/10' 
            : 'bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-30 disabled:bg-neutral-400'
        }`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      {/* Slide Content */}
      <div className={`relative ${isFullscreen ? 'h-screen' : 'aspect-[16/9] w-full'}`}>
        <AnimatePresence mode="wait">
          {currentSlide && (
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${getSlideBackground(currentSlide)}`}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">{currentSlide.title}</h2>
              <div 
                className="prose prose-lg max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: currentSlide.content }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Thumbnails */}
      <AnimatePresence>
        {showThumbnails && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className={`absolute bottom-12 left-0 right-0 z-10 overflow-x-auto py-4 px-8 ${
              isFullscreen 
                ? 'bg-black/50 backdrop-blur-sm' 
                : 'bg-white/90 backdrop-blur-sm border-t border-neutral-200'
            }`}
          >
            <div className="flex gap-4">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentSlideIndex === index 
                      ? 'border-primary scale-110 shadow-lg' 
                      : isFullscreen 
                        ? 'border-transparent hover:border-white/50' 
                        : 'border-transparent hover:border-neutral-300'
                  }`}
                >
                  <div className={`w-full h-full flex items-center justify-center text-xs font-medium p-2 ${getSlideBackground(slide)}`}>
                    {slide.title}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}