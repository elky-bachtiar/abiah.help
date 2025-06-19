import React from 'react';

export const ScrollIndicator: React.FC = () => (
  <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2 animate-bounce z-30">
    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center items-start">
      <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
    </div>
  </div>
);
