import React from 'react';
import { AboutHero } from '../components/about/AboutHero';
import { MissionSection } from '../components/about/MissionSection';
import { ContactForm } from '../components/about/ContactForm';
import { AnimatedBackground, FloatingOrbs, ParticleField } from '../components/effects';


export function AboutPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background overflow-hidden">
      <AnimatedBackground />
      <ParticleField />
      
      <div className="relative">
        <FloatingOrbs orbCount={4} />
        <AboutHero />
      </div>
      
      <div className="relative">
        <MissionSection />
        <ContactForm />
      </div>
    </div>
  );
}