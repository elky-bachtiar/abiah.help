import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-neutral-200 border-t-primary',
        sizes[size]
      )} />
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="loading-dots">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

export function LoadingPulse({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-pulse-gentle">
      {children}
    </div>
  );
}