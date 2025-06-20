import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Clock } from 'lucide-react';
import { sessionTimerAtom } from '../../store/consultation'; 
import { formatDuration } from '../../lib/utils';

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

  const timeRemaining = formatDuration(sessionTimer.remainingTime);
  const timeElapsed = formatDuration(sessionTimer.duration);
  const isLowTime = sessionTimer.remainingTime < 300; // Less than 5 minutes

  return (
    <div className="flex items-center gap-4">
      {/* Elapsed Time */}
      <div className="text-center">
        <div className="text-white/60 text-xs uppercase tracking-wide">Elapsed</div>
        <div className="text-white font-mono text-lg">{timeElapsed}</div>
      </div> 

      {/* Timer Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isLowTime ? 'bg-red-500/20 text-red-400' : 'bg-white/20 text-white'
      }`}>
        <Clock className="w-5 h-5" />
      </div>

      {/* Remaining Time */}
      <div className="text-center">
        <div className="text-white/60 text-xs uppercase tracking-wide">Remaining</div>
        <div className={`font-mono text-lg ${
          isLowTime ? 'text-red-400' : 'text-white'
        }`}>
          {timeRemaining}
        </div>
      </div>

      {/* Low Time Warning */}
      {isLowTime && sessionTimer.remainingTime > 0 && (
        <div className="ml-2 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs">
          Low time!
        </div>
      )}

      {/* Time's Up */}
      {sessionTimer.remainingTime === 0 && (
        <div className="ml-2 px-2 py-1 bg-red-500 rounded text-white text-xs font-medium">
          Time's up!
        </div>
      )}
    </div>
  );
}