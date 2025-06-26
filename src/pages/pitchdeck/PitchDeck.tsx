import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Play, Target, Brain, Rocket, Users, DollarSign, Shield, Zap, Calendar, Check, Award, ChevronDown, Pause, Volume2, VolumeX, Send, Mail, Phone, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StickyBoltLogo } from '../../components/common/StickyBoltLogo';
import { TavusVideoWelcome } from '../../components/hero/TavusVideoWelcome';

// Contact Form Interface
interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  message: string;
  investmentInterest: string;
}

// Timeline Navigation Component
const TimelineNavigation = ({ activeSection, sections }: { activeSection: number; sections: string[] }) => {
  const scrollToSection = (index: number) => {
    const section = document.getElementById(`section-${index}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3"
    >
      {sections.map((section, index) => (
        <motion.button
          key={index}
          onClick={() => scrollToSection(index)}
          className={`group relative flex items-center transition-all duration-300 ${
            activeSection === index ? 'scale-110' : 'hover:scale-105'
          }`}
          whileHover={{ x: -5 }}
        >
          <motion.div
            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
              activeSection === index
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-400 shadow-lg shadow-yellow-400/50'
                : 'bg-gray-800 border-gray-600 hover:border-yellow-400'
            }`}
          />
          <motion.span
            className={`ml-4 text-sm whitespace-nowrap transition-all duration-300 ${
              activeSection === index
                ? 'text-yellow-400 opacity-100'
                : 'text-gray-400 opacity-0 group-hover:opacity-100'
            }`}
          >
            {section}
          </motion.span>
        </motion.button>
      ))}
    </motion.div>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (inView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [inView, value]);
  
  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Floating Background Elements
const FloatingElements = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -400]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -600]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        style={{ y: y1 }}
        className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/2 right-20 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-full blur-3xl"
      />
    </div>
  );
};

export function PitchDeck() {
  const { scrollY, scrollYProgress } = useScroll();
  const [activeSection, setActiveSection] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  
  // Contact form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    message: '',
    investmentInterest: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const sections = [
    "Welcome",
    "Problem", 
    "Solution",
    "Product",
    "Market",
    "Team",
    "Business Model",
    "Technology",
    "The Ask",
    "CTA"
  ];

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX - innerWidth / 2) / innerWidth * 30);
      mouseY.set((clientY - innerHeight / 2) / innerHeight * 30);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Multiple parallax layers with different speeds
  const heroY = useTransform(scrollY, [0, 1000], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 800], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.8]);
  
  // Video parallax
  const videoY = useTransform(scrollY, [0, 1000], [0, -200]);
  const videoScale = useTransform(scrollY, [0, 500], [1, 1.1]);
  
  // Text parallax
  const titleY = useTransform(scrollY, [0, 500], [0, -100]);
  const subtitleY = useTransform(scrollY, [0, 500], [0, -80]);

  // Track active section based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let currentSection = 0;
      
      sections.forEach((_, index) => {
        const section = document.getElementById(`section-${index}`);
        if (section && scrollPosition >= section.offsetTop) {
          currentSection = index;
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Find and control the video element
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const findVideoElement = () => {
      const video = document.querySelector('video') as HTMLVideoElement;
      if (video && !videoElement) {
        setVideoElement(video);
        setIsAudioPlaying(!video.paused);
        setIsMuted(video.muted);
        
        // Add event listeners to sync state
        const handlePlay = () => {
          setIsAudioPlaying(true);
        };
        const handlePause = () => {
          setIsAudioPlaying(false);
        };
        const handleVolumeChange = () => {
          setIsMuted(video.muted);
        };
        const handleLoadedData = () => {
          setIsMuted(video.muted);
          setIsAudioPlaying(!video.paused);
          
          // Ensure video has volume
          if (video.volume === 0) {
            video.volume = 1;
          }
        };
        
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('volumechange', handleVolumeChange);
        video.addEventListener('loadeddata', handleLoadedData);
        
        cleanup = () => {
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
          video.removeEventListener('volumechange', handleVolumeChange);
          video.removeEventListener('loadeddata', handleLoadedData);
        };
      }
    };

    // Only try to find video if we don't have one yet
    if (!videoElement) {
      const timeout = setTimeout(findVideoElement, 500);
      return () => {
        clearTimeout(timeout);
        if (cleanup) cleanup();
      };
    }
    
    return cleanup;
  }, [videoElement]);

  // Audio controls
  const handleAudioToggle = () => {
    if (videoElement) {
      if (isAudioPlaying) {
        videoElement.pause();
        setIsAudioPlaying(false);
      } else {
        videoElement.play().then(() => {
          setIsAudioPlaying(true);
        }).catch(() => {
          setIsAudioPlaying(false);
        });
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoElement) {
      // Set volume to maximum
      videoElement.volume = 1.0;
      
      // Toggle mute state directly
      videoElement.muted = !videoElement.muted;
      
      // Update our state to match
      setIsMuted(videoElement.muted);
      
      // Try to play if not playing and not muted
      if (!videoElement.muted && videoElement.paused) {
        videoElement.play().then(() => {
          setIsAudioPlaying(true);
        }).catch((error) => {
          console.log('Failed to play video:', error);
        });
      }
    } else {
     
      // Try to find video element immediately
      const video = document.querySelector('video') as HTMLVideoElement;
      if (video) {

        // Set volume to maximum
        video.volume = 1.0;
        
        // Toggle mute
        video.muted = !video.muted;
        setVideoElement(video);
        setIsMuted(video.muted);
        
        // Try to play if not playing and not muted
        if (!video.muted && video.paused) {
          video.play().then(() => {
            setIsAudioPlaying(true);
          }).catch((error) => {
            console.log('Failed to play video:', error);
          });
        }        
      } else {
        console.log('Still no video element found');
      }
    }
  };

  // Contact form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Send via Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          role: '',
          message: '',
          investmentInterest: 'general'
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress indicator
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Text reveal animation variants
  const textRevealVariants = {
    hidden: { 
      opacity: 0,
      y: 50,
      filter: "blur(10px)"
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      <FloatingElements />
      
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 origin-left z-50"
        style={{ scaleX: progressScale }}
      />

      {/* Timeline Navigation */}
      <TimelineNavigation activeSection={activeSection} sections={sections} />

      {/* Sticky Bolt Logo */}
      <StickyBoltLogo position="bottom-right" />

      {/* Section 0: Hero Section with Video Background */}
      <motion.section
        id="section-0"
        style={{ opacity: heroOpacity }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Video Background with Parallax */}
        <motion.div
          style={{ 
            y: videoY,
            scale: videoScale
          }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/50 z-10" />
          <TavusVideoWelcome
            onVideoReady={() => {}}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Mouse parallax container */}
        <motion.div
          style={{
            x: smoothMouseX,
            y: smoothMouseY,
          }}
          className="absolute inset-0 will-change-transform z-5"
        >
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-xl animate-pulse delay-300" />
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-16"
        >
          <motion.div
            style={{ y: titleY }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-4 sm:mb-6">
              <motion.span 
                className="block"
                initial="hidden"
                animate="visible"
                custom={0}
                variants={textRevealVariants}
              >
                Meet Abiah,
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-gradient-x"
                initial="hidden"
                animate="visible"
                custom={1}
                variants={textRevealVariants}
              >
                Your AI Startup Mentor
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            style={{ y: subtitleY }}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 sm:mb-12 max-w-3xl mx-auto px-4"
          >
            Get funded through face-to-face video consultations with industry-specific AI mentors
          </motion.p>

          {/* Stats */}
          <motion.div 
            className="flex flex-wrap justify-center gap-8 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">500+</div>
              <div className="text-gray-300 text-sm">Startups Funded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">$50M+</div>
              <div className="text-gray-300 text-sm">Capital Raised</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">85%</div>
              <div className="text-gray-300 text-sm">Success Rate</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, rotate: [0, -1, 1, -1, 0] }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-full overflow-hidden shadow-2xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Consultation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ opacity: 0.2 }}
                />
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Animated scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="text-white/60 text-sm">Scroll to explore</span>
            <ChevronDown className="w-6 h-6 text-white/60" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Audio Controls - Below Hero Section on Left */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="fixed left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-30 flex flex-col gap-4"
      >
        <motion.button
          onClick={handleAudioToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
          title={isAudioPlaying ? "Pause video" : "Play video"}
        >
          {isAudioPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
        </motion.button>
        <motion.button
          onClick={handleMuteToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
          title={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
        </motion.button>
      </motion.div>

      {/* Section 1: Problem */}
      <section id="section-1" className="relative min-h-screen bg-gray-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-red-900/10 to-gray-900 opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="pt-20 pb-16 text-center"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              The{' '}
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Problem
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto px-4">
              <span className="text-red-400 font-bold">70% of startups fail</span>, and it's not because of bad ideas—it's because founders are 
              <span className="text-yellow-400 font-bold"> isolated and overwhelmed</span> when making critical decisions.
            </p>
          </motion.div>

          {/* Problem Items - One per scroll section */}
          <div className="space-y-32 pb-20">
            {[
              {
                stat: "84%", 
                title: "Founder Isolation",
                description: "of founders feel completely alone when making critical business decisions that could make or break their startup.",
                gradient: "from-red-500 to-orange-500",
                visualBoxTitle: "Emotional Toll",
                quote: "I have all the information I need on Google, but what I really need is someone to talk through my decisions with."
              },
              {
                stat: "$300-500", 
                title: "Expensive Traditional Mentors",
                description: "per hour for traditional mentors with 2-week wait times. Most founders can't afford this when they need guidance most.",
                gradient: "from-orange-500 to-yellow-500",
                visualBoxTitle: "Access Barriers",
                quote: "Critical decisions don't happen during business hours. I need someone available when I'm having a crisis at 11 PM on Sunday."
              },
              {
                stat: "$228B", 
                title: "Preventable Failures",
                description: "wasted annually on preventable startup failures. The lack of accessible mentorship is costing the innovation economy.",
                gradient: "from-yellow-500 to-red-500",
                visualBoxTitle: "Economic Impact",
                quote: "General business coaches don't understand startups. I need someone who gets the uncertainty, the funding cycles, the pivot decisions."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                style={{
                  flexDirection: index % 2 === 1 ? 'row-reverse' : 'row'
                }}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className={`text-6xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-6`}
                  >
                    {item.stat}
                  </motion.div>
                  
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                    {item.title}
                  </h3>
                  
                  <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Visual Box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: index % 2 === 0 ? 100 : -100 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                >
                  <div className={`bg-gradient-to-br ${item.gradient} p-1 rounded-2xl shadow-2xl`}>
                    <div className="bg-gray-900 rounded-xl p-6 sm:p-8">
                      <h4 className="text-xl sm:text-2xl font-bold text-white mb-6">
                        {item.visualBoxTitle}
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-red-500">
                          <p className="text-gray-300 italic">
                            "{item.quote}"
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                            <div className="text-2xl font-bold text-red-400">70%</div>
                            <div className="text-sm text-gray-400">Failure Rate</div>
                          </div>
                          <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                            <div className="text-2xl font-bold text-red-400">2 weeks</div>
                            <div className="text-sm text-gray-400">Wait Time</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Solution */}
      <section id="section-2" className="relative min-h-screen bg-gray-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-yellow-900/10 to-gray-900 opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="pt-20 pb-16 text-center"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Solution
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto px-4">
              <span className="text-yellow-400 font-bold">Abiah is the world's first AI video mentor</span> that provides face-to-face guidance 24/7 for just 
              <span className="text-green-400 font-bold"> $99-199/month</span>.
            </p>
          </motion.div>

          {/* Solution Items - One per scroll section */}
          <div className="space-y-32 pb-20">
            {[
              {
                icon: Brain,
                title: "AI Video Mentorship",
                description: "Face-to-face video sessions with industry-specific AI advisors trained in emotional intelligence to build confidence and provide strategic guidance.",
                gradient: "from-yellow-400 to-orange-500",
                features: ["Video mentorship sessions", "Industry-specific AI advisors", "Emotional intelligence training", "24/7 availability"],
                visualBoxTitle: "Mentor Connection",
                quote: "I don't need another productivity tool. I need someone who believes in me and can help me believe in myself."
              },
              {
                icon: Zap,
                title: "Instant Availability",
                description: "Get guidance whenever you need it most. No more waiting weeks for mentor appointments when critical decisions can't wait.",
                gradient: "from-green-400 to-blue-500",
                features: ["24/7 availability", "Instant responses", "No scheduling needed", "Crisis support ready"],
                visualBoxTitle: "24/7 Support",
                quote: "Abiah gives me access to experienced thinking when I need it most, without the scheduling delays."
              },
              {
                icon: DollarSign,
                title: "Affordable Excellence",
                description: "75-85% cost savings compared to traditional consultants while delivering the same quality guidance that helps founders succeed.",
                gradient: "from-blue-400 to-purple-500",
                features: ["75-85% cost savings", "No hourly fees", "Subscription model", "Unlimited access"],
                visualBoxTitle: "Cost Efficiency",
                quote: "Finally, expert-level guidance without the $600/hour fees and week-long scheduling delays."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                style={{
                  flexDirection: index % 2 === 1 ? 'row-reverse' : 'row'
                }}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} inline-block mb-6`}
                  >
                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                    {item.title}
                  </h3>
                  
                  <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="space-y-4">
                    {item.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + featureIndex * 0.1, duration: 0.6 }}
                        className="flex items-center text-gray-300"
                      >
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Visual Box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: index % 2 === 0 ? 100 : -100 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                >
                  <div className={`bg-gradient-to-br ${item.gradient} p-1 rounded-2xl shadow-2xl`}>
                    <div className="bg-gray-900 rounded-xl p-6 sm:p-8">
                      <h4 className="text-xl sm:text-2xl font-bold text-white mb-6">
                        {item.visualBoxTitle}
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-gray-800/30 rounded-2xl p-6 border border-yellow-400/20">
                          <p className="text-xl text-gray-300 italic mb-4">
                            "{item.quote}"
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                              <Brain className="w-6 h-6 text-gray-900" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">Abiah AI</div>
                              <div className="text-sm text-gray-400">Your Personal Startup Mentor</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Product */}
      <section id="section-3" className="relative min-h-screen bg-gray-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="pt-20 pb-16 text-center"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              The{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Product
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto px-4">
              AI-powered video mentorship with intelligent document generation at the perfect timing
            </p>
          </motion.div>

          {/* Product Items - One per scroll section */}
          <div className="space-y-32 pb-20">
            {[
              {
                icon: Brain,
                title: "AI Video Mentors",
                description: "Industry-specific AI advisors (FinTech, HealthTech, B2B SaaS) providing face-to-face video consultations with emotional intelligence and strategic guidance.",
                gradient: "from-blue-500 to-purple-500",
                features: ["FinTech specialist mentors", "HealthTech expert guidance", "B2B SaaS strategic advice", "Emotional intelligence training"]
              },
              {
                icon: Target,
                title: "AI Document Generation",
                description: "Intelligent document creation system that generates pitch decks, business plans, and market analysis based on your conversations and startup data.",
                gradient: "from-green-500 to-teal-500",
                features: ["Auto-generated pitch decks", "Business plan creation", "Market analysis reports", "Financial projections"]
              },
              {
                icon: Zap,
                title: "AI Conversation Feedback",
                description: "Real-time analysis of video conversations providing insights, suggestions, and actionable feedback to improve your pitch and business strategy.",
                gradient: "from-orange-500 to-red-500",
                features: ["Real-time conversation analysis", "Pitch improvement suggestions", "Strategy optimization", "Performance insights"]
              },
              {
                icon: Users,
                title: "Voice-to-Document AI",
                description: "Generate comprehensive business documents simply by talking to your AI mentor. Transform conversations into professional deliverables instantly.",
                gradient: "from-purple-500 to-pink-500",
                features: ["Voice-activated generation", "Conversation-to-document", "Instant professional formatting", "Multi-format exports"]
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                style={{
                  flexDirection: index % 2 === 1 ? 'row-reverse' : 'row'
                }}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} inline-block mb-6`}
                  >
                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                    {item.title}
                  </h3>
                  
                  <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="space-y-4">
                    {item.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + featureIndex * 0.1, duration: 0.6 }}
                        className="flex items-center text-gray-300"
                      >
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Visual Box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: index % 2 === 0 ? 100 : -100 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                >
                  <div className={`bg-gradient-to-br ${item.gradient} p-1 rounded-2xl shadow-2xl`}>
                    <div className="bg-gray-900 rounded-xl p-6 sm:p-8">
                      <h4 className="text-xl sm:text-2xl font-bold text-white mb-6">
                        Key Features
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Success Rate</span>
                            <span className="text-2xl font-bold text-green-400">
                              {index === 0 ? '94%' : index === 1 ? '89%' : index === 2 ? '96%' : '91%'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Avg. Response Time</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                              {index === 0 ? '<1s' : index === 1 ? '2-5s' : index === 2 ? 'Real-time' : '<3s'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">User Satisfaction</span>
                            <span className="text-2xl font-bold text-white">
                              {index === 0 ? '4.9/5' : index === 1 ? '4.8/5' : index === 2 ? '4.9/5' : '4.7/5'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Market & Traction */}
      <section id="section-4" className="min-h-screen flex items-center justify-center py-20 px-8 bg-gradient-to-b from-gray-900 to-green-900/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              Market & <span className="text-green-400">Traction</span>
            </h2>
            <p className="text-2xl text-gray-300">
              We're creating an entirely new category: AI startup mentorship
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 57.2, suffix: "B", prefix: "$", label: "Market Size", desc: "Startup advisory + business coaching" },
              { value: 2400, suffix: "+", label: "Founders Surveyed", desc: "91% preferring video mentorship" },
              { value: 150, suffix: "K", prefix: "$", label: "Pre-orders", desc: "From founders paying for early access" },
              { value: 85, suffix: "%", label: "Conversion Rate", desc: "From beta sessions to paid subscriptions" }
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-400/20 hover:border-green-400/40 transition-colors">
                  <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                    <AnimatedCounter value={metric.value} suffix={metric.suffix} prefix={metric.prefix} />
                  </div>
                  <div className="text-xl font-semibold text-white mb-2">{metric.label}</div>
                  <div className="text-sm text-gray-400">{metric.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-3xl p-8 border border-green-500/30"
          >
            <p className="text-2xl text-gray-300 italic">
              "We're creating an entirely new category: AI startup mentorship."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Visionary Team */}
      <section id="section-5" className="min-h-screen flex items-center justify-center py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              Visionary <span className="text-blue-400">Team</span>
            </h2>
            <p className="text-2xl text-gray-300">
              Human + AI founding team uniquely positioned to succeed
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Elky Bachtiar",
                title: "CEO & Founder",
                description: "DevOps Engineer at Dutch Government, Ex-CTO Avazu, 3x founder, AI DevSecOps Specialist",
                image: "/images/Elky.jpeg",
                gradient: "from-yellow-400 to-orange-500",
                links: ["LinkedIn", "GitHub"]
              },
              {
                name: "Abiah",
                title: "AI Co-Founder & CTO", 
                description: "Advanced LLM Architecture, 1B+ Parameters, FinTech Specialist trained to get founders funded",
                image: "/images/Abiah-ai-co-founder.png",
                gradient: "from-blue-500 to-purple-500",
                stats: ["1B+ Parameters", "FinTech Expert"]
              },
              {
                name: "Nova",
                title: "AI Innovation Director",
                description: "Real-time Analytics Expert, Reinforcement Learning, 99.8% Decision Accuracy",
                icon: Zap,
                gradient: "from-purple-500 to-pink-500",
                stats: ["99.8% Accuracy", "Real-time Analytics"]
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.gradient} p-1 mb-6`}>
                      {member.image ? (
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : member.icon ? (
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                          <member.icon className="w-10 h-10 text-white" />
                        </div>
                      ) : null}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                    <div className={`text-lg font-semibold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent mb-4`}>
                      {member.title}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{member.description}</p>
                    
                    {member.stats && (
                      <div className="flex gap-2 flex-wrap justify-center">
                        {member.stats.map((stat, statIndex) => (
                          <span key={statIndex} className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${member.gradient} text-gray-900 font-semibold`}>
                            {stat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Simple, Transparent Pricing */}
      <section id="section-6" className="relative min-h-screen bg-gray-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="pt-20 pb-16 text-center"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Simple,{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Transparent
              </span>{' '}
              Pricing
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto px-4">
              Choose the plan that fits your startup's growth stage and unlock your potential today.
            </p>
          </motion.div>

          {/* Pricing Plans - One per scroll section */}
          <div className="space-y-32 pb-20">
            {[
              {
                name: "Starter",
                price: "$99",
                period: "/month",
                description: "Perfect for getting started",
                features: [
                  "2 video sessions (40 minutes total)",
                  "AI mentorship & document generation",
                  "Basic analytics & community access",
                  "Email support"
                ],
                popular: false
              },
              {
                name: "Professional", 
                price: "$199",
                period: "/month",
                description: "Most popular for growing startups",
                features: [
                  "3 video sessions (75 minutes total)",
                  "Industry-specific AI mentors",
                  "Session recordings & AI insights",
                  "Priority support & team access"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom", 
                description: "For scaling organizations",
                features: [
                  "Unlimited sessions & team access",
                  "Custom AI training & white-label",
                  "24/7 support & dedicated manager",
                  "API access & integrations"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                style={{
                  flexDirection: index % 2 === 1 ? 'row-reverse' : 'row'
                }}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="relative mb-6"
                  >
                    {plan.popular && (
                      <div className="inline-block mb-4">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-white">{plan.price}</span>
                      {plan.period && <span className="text-xl text-gray-400">{plan.period}</span>}
                    </div>
                  </motion.div>
                  
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                    {plan.name}
                  </h3>
                  
                  <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                    {plan.description}
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + featureIndex * 0.1, duration: 0.6 }}
                        className="flex items-center text-gray-300"
                      >
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </motion.div>
                    ))}
                  </div>

                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(249, 185, 78, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900' 
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </div>

                {/* Visual Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: index % 2 === 0 ? 100 : -100 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                >
                  <div className={`${plan.popular ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-gray-600 to-gray-700'} p-1 rounded-2xl shadow-2xl`}>
                    <div className="bg-gray-900 rounded-xl p-6 sm:p-8">
                      <h4 className="text-xl sm:text-2xl font-bold text-white mb-6">
                        Perfect For
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Team Size</span>
                          <span className="text-2xl sm:text-3xl font-bold text-white">
                            {index === 0 ? '1-2' : index === 1 ? '3-10' : '10+'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Monthly Revenue</span>
                          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            {index === 0 ? '$0-10K' : index === 1 ? '$10K-100K' : '$100K+'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Growth Stage</span>
                          <span className="text-2xl sm:text-3xl font-bold text-white">
                            {index === 0 ? 'Idea' : index === 1 ? 'Growth' : 'Scale'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Technology */}
      <section id="section-7" className="min-h-screen flex items-center justify-center py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              Technology <span className="text-cyan-400">Stack</span>
            </h2>
            <p className="text-2xl text-gray-300">
              AI, video, and compliance infrastructure at scale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Advanced AI Engine",
                description: "1B+ parameter LLMs with emotional intelligence and startup-specific training",
                gradient: "from-cyan-500 to-blue-500",
                features: ["Natural Language Processing", "Emotional Intelligence", "Industry Specialization"]
              },
              {
                icon: Play,
                title: "Tavus Video Platform",
                description: "Real-time video consultations with AI mentors through cutting-edge CVI technology",
                gradient: "from-green-500 to-teal-500",  
                features: ["Real-time Video", "WebRTC Integration", "High-Quality Streaming"]
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-level encryption and compliance with global data protection standards",
                gradient: "from-orange-500 to-red-500",
                features: ["End-to-End Encryption", "GDPR Compliant", "SOC 2 Certified"]
              }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all h-full">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tech.gradient} mb-6`}>
                    <tech.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{tech.title}</h3>
                  <p className="text-gray-300 mb-6">{tech.description}</p>
                  <div className="space-y-2">
                    {tech.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: The Ask */}
      <section id="section-8" className="min-h-screen flex items-center justify-center py-20 px-8 bg-gradient-to-b from-gray-900 to-yellow-900/20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              The <span className="text-yellow-400">Ask</span>
            </h2>
            <p className="text-2xl md:text-3xl text-gray-300 mb-12 leading-relaxed">
              Seeking <span className="text-yellow-400 font-bold">$3.5M seed round</span> to scale our human + AI founding team and capture the 
              <span className="text-green-400 font-bold"> $890M serviceable market</span> in AI-powered startup mentorship.
            </p>
            
            <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl p-8 backdrop-blur-sm border border-yellow-400/30">
              <h3 className="text-3xl font-bold text-white mb-6">Use of Funds</h3>
              <div className="space-y-4">
                {[
                  { category: "Engineering & AI Development", percentage: "40%", amount: "$1.4M" },
                  { category: "Marketing & Customer Acquisition", percentage: "30%", amount: "$1.05M" },
                  { category: "Operations & Compliance", percentage: "20%", amount: "$700K" },
                  { category: "Reserve & Contingency", percentage: "10%", amount: "$350K" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-center bg-gray-800/30 rounded-lg p-4"
                  >
                    <span className="text-gray-300">{item.category}</span>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{item.percentage}</div>
                      <div className="text-sm text-gray-400">{item.amount}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: 5, suffix: "M", prefix: "$", label: "ARR Target", desc: "Within 18 months" },
                { value: 890, suffix: "M", prefix: "$", label: "Serviceable Market", desc: "AI mentorship TAM" },
                { value: 3000, suffix: "+", label: "Customer Target", desc: "Paying subscribers" },
                { value: 75, suffix: "M", prefix: "$", label: "Revenue Potential", desc: "At market leadership" }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="text-center bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/20"
                >
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    <AnimatedCounter value={metric.value} suffix={metric.suffix} prefix={metric.prefix} />
                  </div>
                  <div className="text-lg font-semibold text-white mb-1">{metric.label}</div>
                  <div className="text-sm text-gray-400">{metric.desc}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              viewport={{ once: true }}
              className="mt-8 text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl p-6 border border-yellow-500/30"
            >
              <p className="text-xl text-gray-300 font-semibold">
                Join us in democratizing startup success.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 9: CTA with Contact Form */}
      <section id="section-9" className="min-h-screen flex items-center justify-center py-20 px-8 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Ready to <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Transform</span> Your Startup?
            </h2>
            <p className="text-xl text-gray-300 italic font-semibold mb-8">
              Let's Build the Future Together
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - CTA Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 p-6 rounded-lg">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">🚀 Join the Revolution</h3>
                <p className="text-base sm:text-lg mb-4">
                  Abiah AI is revolutionizing how startups succeed. With our AI-powered video mentorship, 
                  we're turning the 70% failure rate into a 78% success story.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-gray-900" />
                    First-mover advantage in AI video mentorship
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-gray-900" />
                    $150K+ in pre-committed revenue
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-gray-900" />
                    Path to $75M ARR in 5 years
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
                <h3 className="text-lg sm:text-xl font-bold mb-3">Get In Touch</h3>
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-3" />
                    <span className="font-semibold">founders@abiah.help</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 mr-3" />
                    <span className="font-semibold">Schedule a demo at abiah.help</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3" />
                    <span className="font-semibold">Join our founder community</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/20 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium">🚀 Early Access Available</p>
                  <p className="text-xs">Beta program with lifetime founder pricing</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-yellow-400 rounded-lg p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Express Your Interest</h3>
              
              {submitStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Thank you! Your inquiry has been sent successfully.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Sorry, there was an error sending your message. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder="Your company/fund"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder="Your title/role"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Interest
                  </label>
                  <select
                    name="investmentInterest"
                    value={formData.investmentInterest}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  >
                    <option value="general">General Interest</option>
                    <option value="demo">Demo Request</option>
                    <option value="investment">Investment Opportunity</option>
                    <option value="partnership">Strategic Partnership</option>
                    <option value="customer">Potential Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    placeholder="Tell us about your interest in Abiah AI..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 py-3 px-6 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-xs sm:text-sm">
              By submitting this form, you agree to be contacted regarding opportunities with Abiah.help.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}