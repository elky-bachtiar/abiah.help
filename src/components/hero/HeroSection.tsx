import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, Zap, Users, Target } from 'lucide-react';
import { userDisplayNameAtom, isAuthenticatedAtom } from '../../store/auth';
import { Button } from '../ui/Button';
import { TavusVideoWelcome } from './TavusVideoWelcome';
import { ScrollIndicator } from './ScrollIndicator';
import { FeatureGrid } from './FeatureGrid';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function HeroSection() {
  const [displayName] = useAtom(userDisplayNameAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [videoReady, setVideoReady] = useState(false);

  const greeting = isAuthenticated 
    ? `Welcome back, ${displayName}!`
    : 'Meet Abiah, Your AI Startup Mentor';

  const subtitle = isAuthenticated
    ? "Ready for your next mentorship session? Let's continue building your startup success."
    : "Get funded through face-to-face video consultations with industry-specific AI mentors.";

  return (
    <section className="relative min-h-screen hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white z-20"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {greeting}
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {subtitle}
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="flex flex-wrap gap-8 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">500+</div>
                <div className="text-blue-200 text-sm">Startups Funded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">$50M+</div>
                <div className="text-blue-200 text-sm">Capital Raised</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">85%</div>
                <div className="text-blue-200 text-sm">Success Rate</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button
                size="lg"
                variant="secondary"
                className="group animate-bounce hover:animate-none transition-all duration-300 shadow-lg hover:scale-105"
                onClick={() => {
                  const element = document.getElementById('consultation-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Free Consultation
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="mt-12 pt-8 border-t border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <p className="text-blue-200 text-sm mb-4">Trusted by founders from:</p>
              <div className="flex flex-wrap gap-6 items-center opacity-70">
                <div className="text-white font-semibold">Y Combinator</div>
                <div className="text-white font-semibold">Techstars</div>
                <div className="text-white font-semibold">500 Startups</div>
                <div className="text-white font-semibold">Seedcamp</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              {!videoReady && (
                <div className="aspect-video bg-gradient-to-br from-primary to-primary-800 rounded-xl flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              )}
              
              <TavusVideoWelcome
                onVideoReady={() => setVideoReady(true)}
                className={videoReady ? 'block' : 'hidden'}
              />
              
              {/* Video Overlay */}
              <div className="absolute inset-6 rounded-xl video-overlay pointer-events-none" />
            </div>

            {/* Floating Feature Cards */}
            <div className="absolute -left-6 top-1/4 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="bg-white rounded-lg p-4 shadow-lg max-w-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary">Secure & Private</div>
                    <div className="text-sm text-text-secondary">End-to-end encryption</div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="absolute -right-6 bottom-1/4 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="bg-white rounded-lg p-4 shadow-lg max-w-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary">Instant Results</div>
                    <div className="text-sm text-text-secondary">AI responses in real-time</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-20"
        >
          <FeatureGrid />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <ScrollIndicator />
      </motion.div>
    </section>
  );
}