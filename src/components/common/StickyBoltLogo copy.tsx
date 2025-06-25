import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StickyBoltLogoProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark' | 'auto';
}

export function StickyBoltLogo({
  className,
  position = 'bottom-right',
  size = 'md',
  theme = 'auto'
}: StickyBoltLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Determine if dark mode should be used
  useEffect(() => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY + 50) {
        setIsVisible(false);
        setLastScrollY(currentScrollY);
      } else if (currentScrollY < lastScrollY - 50) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Determine position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Determine size classes
  const sizeClasses = {
    'sm': 'w-10 h-10',
    'md': 'w-14 h-14',
    'lg': 'w-20 h-20'
  };

  // Get the appropriate logo based on theme
  const logoSrc = isDarkMode 
    ? '/images/bolt/bolt-white_circle_360x360.png'
    : '/images/bolt/bolt-black_circle_360x360.png';

  return (
    <motion.div
      className={cn(
        'fixed z-50 transition-all duration-300',
        positionClasses[position],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.a
        href="https://bolt.new/?rid=dm8ttl."
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'block rounded-full shadow-lg transition-transform duration-300',
          sizeClasses[size],
          isHovered ? 'scale-110' : 'scale-100'
        )}
        whileHover={{ rotate: 10 }}
        whileTap={{ scale: 0.95 }}
        title="Built with Bolt"
      >
        <img
          src={logoSrc}
          alt="Built with Bolt"
          className="w-full h-full object-contain"
        />
      </motion.a>
    </motion.div>
  );
}