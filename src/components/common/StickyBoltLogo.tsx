import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StickyBoltLogoProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function StickyBoltLogo({
  className,
  position = 'bottom-right',
}: StickyBoltLogoProps) {
  const [useWhiteLogo, setUseWhiteLogo] = useState(true); // Default: Hero = white
  const heroRef = useRef<HTMLElement | null>(null);
  const consultationRef = useRef<HTMLElement | null>(null);
  const pricingRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    heroRef.current = document.querySelector('section.hero-gradient');
    consultationRef.current = document.getElementById('consultation-section');
    pricingRef.current = document.querySelector('section.bg-background-secondary');

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter(entry => entry.isIntersecting).map(entry => entry.target.id || entry.target.className);

        // If Hero is in view, use white logo
        if (visibleSections.some(id => id.includes('hero-gradient'))) {
          setUseWhiteLogo(true);
        }
        // If consultation or pricing is visible, use black logo
        else if (
          visibleSections.some(id =>
            id.includes('consultation-section') ||
            id.includes('bg-background-secondary')
          )
        ) {
          setUseWhiteLogo(false);
        }
      },
      {
        threshold: 0.5,
      }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (consultationRef.current) observer.observe(consultationRef.current);
    if (pricingRef.current) observer.observe(pricingRef.current);

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
      if (consultationRef.current) observer.unobserve(consultationRef.current);
      if (pricingRef.current) observer.unobserve(pricingRef.current);
    };
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <motion.div
      className={cn(
        'fixed z-50 transition-all duration-300',
        positionClasses[position],
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.a
        href="https://bolt.new/?rid=dm8ttl."
        target="_blank"
        rel="noopener noreferrer"
        className="block w-20 h-20 rounded-full shadow-lg transition-transform"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        title="Built with Bolt"
      >
        <img
          src={
            useWhiteLogo
              ? '/images/bolt/bolt-white_circle_360x360.png'
              : '/images/bolt/bolt-black_circle_360x360.png'
          }
          alt="Built with Bolt"
          className="w-full h-full object-contain"
        />
      </motion.a>
    </motion.div>
  );
}
