import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Clock, AlertTriangle } from 'lucide-react';
import { sessionTimerAtom } from '../../store/consultation'; 
import { formatDuration } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function SessionTimer() {
  const [sessionTimer, setSessionTimer] = useAtom(sessionTimerAtom);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (sessionTimer.isActive) {
      intervalId = setInterval(() => {
        setSessionTimer(prev => {
          const elapsed = Math.floor((Date.now() - prev.startTime.getTime()) / 1000);
          const remaining = Math.max(0, prev.remainingTime - elapsed);
           
          return {
            ...prev,
            duration: elapsed,
            remainingTime: remaining,
          };
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionTimer.isActive, setSessionTimer]);

  // Don't render if timer is not active
  if (!sessionTimer.isActive) {
    return null;
  }

  const timeRemaining = formatDuration(sessionTimer.remainingTime);
  const timeElapsed = formatDuration(sessionTimer.duration);
  const isLowTime = sessionTimer.remainingTime < 300; // Less than 5 minutes
  const isVeryLowTime = sessionTimer.remainingTime < 60; // Less than 1 minute
  const isTimeUp = sessionTimer.remainingTime === 0;

  return (
    <motion.div 
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`
        bg-black/80 backdrop-blur-md rounded-2xl px-6 py-3 
        border transition-all duration-300
        ${isTimeUp 
          ? 'border-red-500/50 bg-red-900/20' 
          : isVeryLowTime 
          ? 'border-red-400/50 bg-red-900/10' 
          : isLowTime 
          ? 'border-amber-400/50 bg-amber-900/10' 
          : 'border-white/20'
        }
      `}>
        <div className="flex items-center gap-4">
          {/* Elapsed Time */}
          <div className="text-center">
            <div className="text-white/60 text-xs uppercase tracking-wide font-medium">
              Elapsed
            </div>
            <div className="text-white font-mono text-lg font-semibold">
              {timeElapsed}
            </div>
          </div> 

          {/* Timer Icon with pulse animation for low time */}
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
            ${isTimeUp 
              ? 'bg-red-500/30 text-red-300' 
              : isVeryLowTime 
              ? 'bg-red-500/20 text-red-400 animate-pulse' 
              : isLowTime 
              ? 'bg-amber-500/20 text-amber-400' 
              : 'bg-white/20 text-white'
            }
          `}>
            {isLowTime ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>

          {/* Remaining Time */}
          <div className="text-center">
            <div className="text-white/60 text-xs uppercase tracking-wide font-medium">
              Remaining
            </div>
            <div className={`
              font-mono text-lg font-semibold transition-colors duration-300
              ${isTimeUp 
                ? 'text-red-300' 
                : isVeryLowTime 
                ? 'text-red-400' 
                : isLowTime 
                ? 'text-amber-400' 
                : 'text-white'
              }
            `}>
              {timeRemaining}
            </div>
          </div>

          {/* Status Indicators */}
          <AnimatePresence>
            {isTimeUp && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="ml-2 px-3 py-1 bg-red-500 rounded-full text-white text-xs font-semibold"
              >
                Time's Up!
              </motion.div>
            )}
            
            {!isTimeUp && isVeryLowTime && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="ml-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-medium animate-pulse"
              >
                Urgent!
              </motion.div>
            )}
            
            {!isTimeUp && !isVeryLowTime && isLowTime && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="ml-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-xs font-medium"
              >
                Low Time!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}