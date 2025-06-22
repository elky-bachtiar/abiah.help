import React from 'react';
import { AboutHero } from '../components/about/AboutHero';
import { MissionSection } from '../components/about/MissionSection';
import { ValuesSection } from '../components/about/ValuesSection';
import { ContactForm } from '../components/about/ContactForm';

export function AboutPage() {
  return (
    <div className="min-h-screen">
      <AboutHero />
      <MissionSection />
      <ValuesSection />
      <ContactForm />
    </div>
  );
}