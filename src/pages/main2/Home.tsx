import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Zap, Shield, Globe, ChevronDown, Menu, X, Brain, Target, Rocket, Award, Check, Star, Play, Pause, Volume2, VolumeX, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TavusVideoWelcome } from '../../components/hero/TavusVideoWelcome';
import { StickyBoltLogo } from '../../components/common/StickyBoltLogo';

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

// Custom Header Component
const CustomHeader = () => {
  const { scrollY } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0, 0, 0, 0)", "rgba(17, 24, 39, 0.8)"]
  );
  
  const headerBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(12px)"]
  );

  return (
    <motion.header
      style={{
        backgroundColor: headerBg,
        backdropFilter: headerBlur,
      }}
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold text-white"
            >
              ABIAH
            </motion.div>
          </Link>

          {/* CTA Button - Desktop only */}
          <div className="hidden md:block">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-full"
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-gray-900/95 backdrop-blur-lg"
        >
          <div className="px-4 py-4 space-y-3">
            <Link to="/register" className="block">
              <button className="w-full px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-full">
                Get Started
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

// Shape definitions
const shapes = {
  circle: "rounded-full",
  triangle: "clip-path-triangle",
  hexagon: "clip-path-hexagon",
  square: "rounded-lg rotate-45"
} as const;

// Geometric shape components
const FloatingShape = ({ type, className, style, scrollSpeed = 1 }: { type: keyof typeof shapes; className?: string; style?: React.CSSProperties; scrollSpeed?: number }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * scrollSpeed]);
  
  return (
    <motion.div
      style={{ ...style, y }}
      className={`absolute ${shapes[type]} ${className}`}
    />
  );
};

// Everything You Need to Get Funded - Transform Style Component
const EverythingYouNeedSection = () => {
  const { scrollY } = useScroll();
  
  const fundingItems = [
    {
      icon: Target,
      title: "AI-Powered Pitch Decks",
      description: "Generate investor-ready presentations that tell your story compellingly and professionally.",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: Brain,
      title: "Market Analysis",
      description: "Deep market research and competitive analysis powered by real-time data.",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: Rocket,
      title: "Financial Projections", 
      description: "Accurate financial models and projections that investors trust.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Investor Networks",
      description: "Access to curated investor networks matched to your industry and stage.",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <section className="relative min-h-screen bg-gray-900 overflow-hidden">
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
            Everything You Need{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              to Get Funded
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto px-4">
            From idea to investment, our comprehensive platform provides all the tools and guidance needed for funding success.
          </p>
        </motion.div>

        {/* Funding Items - One per scroll section */}
        <div className="space-y-32 pb-20">
          {fundingItems.map((item, index) => (
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
                  {[
                    "Industry-specific templates",
                    "Real-time collaboration",
                    "AI-powered optimization",
                    "Expert review process"
                  ].map((feature, featureIndex) => (
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
                      Success Metrics
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Success Rate</span>
                        <span className="text-2xl sm:text-3xl font-bold text-white">
                          {index === 0 ? '94%' : index === 1 ? '87%' : index === 2 ? '91%' : '89%'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Avg. Funding</span>
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                          ${index === 0 ? '2.1M' : index === 1 ? '1.8M' : index === 2 ? '2.4M' : '2.7M'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Time to Fund</span>
                        <span className="text-2xl sm:text-3xl font-bold text-white">
                          {index === 0 ? '42' : index === 1 ? '38' : index === 2 ? '35' : '41'} days
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
  );
};

// Incoming Box Effect Component
const IncomingBoxEffect = () => {
  const { scrollY } = useScroll();
  const boxRef = useRef<HTMLDivElement>(null);
  
  const boxX = useTransform(scrollY, [1400, 1800], [400, 0]);
  const boxOpacity = useTransform(scrollY, [1400, 1600], [0, 1]);
  
  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-5xl font-bold text-white mb-6">
            Transform Your <span className="text-yellow-400">Startup Vision</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            From idea to IPO, our AI-powered platform provides everything you need to build, scale, and succeed.
          </p>
          <div className="space-y-4">
            {[
              "Industry-specific AI mentors",
              "Real-time market analysis",
              "Automated pitch deck generation",
              "Investor matching algorithms"
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex items-center text-gray-300"
              >
                <Check className="w-5 h-5 text-green-500 mr-3" />
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div
          ref={boxRef}
          style={{ x: boxX, opacity: boxOpacity }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl p-8 border border-yellow-400/30 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">Success Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Funding Success Rate</span>
                <span className="text-2xl font-bold text-yellow-400">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Funding Amount</span>
                <span className="text-2xl font-bold text-yellow-400">$2.3M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Time to Funding</span>
                <span className="text-2xl font-bold text-yellow-400">45 days</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export function Home() {
  const { scrollY, scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const opportunityRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const investorsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  
  const isInView = useInView(featuresRef, { once: false, amount: 0.3 });
  const isTextInView = useInView(textRef, { once: false, amount: 0.5 });
  const isOpportunityInView = useInView(opportunityRef, { once: true, amount: 0.3 });
  const isTestimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.3 });
  const isInvestorsInView = useInView(investorsRef, { once: true, amount: 0.3 });

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
  
  // Background layers
  const bgLayer1Y = useTransform(scrollY, [0, 1000], [0, -600]);
  const bgLayer2Y = useTransform(scrollY, [0, 1000], [0, -450]);
  const bgLayer3Y = useTransform(scrollY, [0, 1000], [0, -300]);
  
  // Text parallax
  const titleY = useTransform(scrollY, [0, 500], [0, -100]);
  const subtitleY = useTransform(scrollY, [0, 500], [0, -80]);
  
  // Rotation transforms
  const rotate = useTransform(scrollY, [0, 1000], [0, 360]);
  const rotateReverse = useTransform(scrollY, [0, 1000], [0, -360]);


  // Progress indicator
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

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

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced machine learning that understands context and delivers personalized experiences",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Real-time responses with sub-second latency for seamless conversations",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance with global data protection standards",
      gradient: "from-green-500 to-teal-500",
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "Deploy across multiple regions with automatic load balancing and failover",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CEO, TechVision",
      content: "This platform transformed how we engage with customers. The AI is incredibly intuitive.",
      avatar: "SC",
      rating: 5,
      gradient: "from-blue-500 to-purple-500",
    },
    {
      name: "Marcus Johnson",
      role: "CTO, InnovateCorp",
      content: "The best investment we've made. ROI was visible within the first month.",
      avatar: "MJ",
      rating: 5,
      gradient: "from-green-500 to-teal-500",
    },
    {
      name: "Elena Rodriguez",
      role: "VP Sales, GlobalTech",
      content: "Our conversion rates increased by 300%. This is the future of customer interaction.",
      avatar: "ER",
      rating: 5,
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for early-stage startups",
      features: [
        "1 AI consultation per month",
        "Basic pitch deck template",
        "Community access",
        "Email support"
      ]
    },
    {
      name: "Growth",
      price: "$99",
      period: "/month",
      description: "For growing startups seeking funding",
      features: [
        "5 AI consultations per month",
        "Advanced pitch deck creation",
        "Market analysis tools",
        "Investor matching",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Scale",
      price: "$299",
      period: "/month",
      description: "For established companies scaling up",
      features: [
        "Unlimited AI consultations",
        "Custom pitch deck design",
        "Advanced analytics",
        "Direct investor introductions",
        "Dedicated success manager"
      ]
    }
  ];

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
    <>
      {/* Custom Header */}
      <CustomHeader />

      <StickyBoltLogo position="bottom-right" />

      <div className="relative min-h-screen overflow-hidden bg-gray-900">
        {/* Progress indicator */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 origin-left z-50"
          style={{ scaleX: progressScale }}
        />

        {/* Background parallax layers */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Layer 1 - Slowest */}
          <motion.div
            style={{ y: bgLayer1Y }}
            className="absolute inset-0"
          >
            <FloatingShape
              type="circle"
              className="w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl"
              style={{ top: '10%', left: '20%' }}
              scrollSpeed={0.2}
            />
            <FloatingShape
              type="circle"
              className="w-72 h-72 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl"
              style={{ top: '60%', right: '15%' }}
              scrollSpeed={0.3}
            />
          </motion.div>

          {/* Layer 2 - Medium */}
          <motion.div
            style={{ y: bgLayer2Y }}
            className="absolute inset-0"
          >
            <motion.div
              style={{ rotate }}
              className="absolute top-20 left-32 w-32 h-32 border-4 border-yellow-400/20 rounded-lg"
            />
            <motion.div
              style={{ rotate: rotateReverse }}
              className="absolute bottom-40 right-40 w-24 h-24 border-4 border-orange-400/20 rounded-full"
            />
          </motion.div>

          {/* Layer 3 - Fastest */}
          <motion.div
            style={{ y: bgLayer3Y }}
            className="absolute inset-0"
          >
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full" />
            <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-yellow-400/40 rounded-full" />
            <div className="absolute bottom-1/4 left-2/3 w-2 h-2 bg-orange-400/40 rounded-full" />
          </motion.div>
        </div>

        {/* Hero Section with Video Background */}
        <motion.section
          ref={heroRef}
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

        {/* Everything You Need to Get Funded - Transform Style */}
        <EverythingYouNeedSection />

        {/* Incoming Box Effect */}
        <IncomingBoxEffect />

        {/* Features Section */}
        <section ref={featuresRef} className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/50 backdrop-blur-xl">
          <motion.div
            style={{ y: useTransform(scrollY, [2000, 2800], [100, -100]) }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-2xl" />
          </motion.div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              ref={textRef}
              initial={{ opacity: 0 }}
              animate={isTextInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Built for <span className="text-yellow-400">Scale</span>, Designed for <span className="text-orange-400">Impact</span>
              </h2>
              <motion.p 
                className="text-xl text-gray-400 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={isTextInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Every feature engineered to deliver exceptional experiences and measurable results
              </motion.p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={isInView ? { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    rotate: [0, -2, 2, -1, 0]
                  } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    rotate: { duration: 0.4, delay: index * 0.1 + 0.3 }
                  }}
                  whileHover={{ 
                    y: -15, 
                    scale: 1.02,
                    transition: { duration: 0.2 } 
                  }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 rounded-2xl transition-opacity`} />
                  <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 transform-gpu h-full">
                    <motion.div 
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* For Investors Section - From Main Page */}
        <section ref={investorsRef} className="py-24 bg-gradient-to-b from-gray-900 to-blue-900/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isInvestorsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-6 text-white">For <span className="text-yellow-400">Investors</span></h2>
                <p className="text-xl mb-8 text-gray-300">
                  Abiah represents a $50B opportunity in the rapidly growing AI mentorship market. Our proprietary technology delivers measurable results for startups.  
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      <AnimatedCounter value={450} suffix="%" />
                    </div>
                    <div className="text-gray-800">YoY Growth</div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-orange-500 mb-2">
                      <AnimatedCounter value={92} suffix="%" />
                    </div>
                    <div className="text-gray-800">Customer Retention</div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      <AnimatedCounter value={75} suffix="M+" />
                    </div>
                    <div className="text-gray-800">Total Capital Raised</div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      <AnimatedCounter value={5} suffix="x" />
                    </div>
                    <div className="text-gray-800">ROI for Partners</div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                  onClick={() => window.open('https://investor-deck.abiah.help', '_blank')}
                >
                  <span className="flex items-center gap-2">
                    View Investor Deck
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInvestorsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-1 rounded-2xl shadow-2xl rotate-3 hidden lg:block">
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">Market Opportunity</h3>
                    <div className="mt-8 flex flex-col space-y-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <Check size={20} className="text-green-600" />
                        </div>
                        <div className="text-gray-800">Only 2% of startups have access to quality mentorship</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <Check size={20} className="text-green-600" />
                        </div>
                        <div className="text-gray-800">83% of startups fail within the first 3 years</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <Check size={20} className="text-green-600" />
                        </div>
                        <div className="text-gray-800">Mentored startups grow 3.5x faster than non-mentored</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                          <Users size={20} className="text-orange-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">3.2M Underserved Startups</div>
                          <div className="text-sm text-gray-600">In our target markets</div>
                        </div>
                      </div>
                      
                      <div className="h-64 w-full bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <img 
                          src="/images/growth-projection-chart.png" 
                          alt="Growth Projection Chart showing 450% YoY growth trajectory" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Fallback if image doesn't exist
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-600 font-medium">Growth Projection Chart</div>';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The $50B Opportunity Section */}
        <section ref={opportunityRef} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <motion.div
            initial={{ opacity: 0.1 }}
            whileInView={{ opacity: 0.3 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-yellow-400/20 blur-3xl"
          />
          
          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isOpportunityInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-6 text-white">
                The <span className="text-yellow-400">$50B</span> Opportunity
              </h2>
              <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-12">
                AI-powered mentorship is revolutionizing how startups succeed. 
                We're at the forefront of this transformation.
              </p>
            </motion.div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={isOpportunityInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
              >
                <Target className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-white">Market Leadership</h3>
                <p className="text-gray-300 mb-6">
                  Positioned to capture 15% of the AI mentorship market by 2026 with our unique approach.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-300">Patent-pending technology</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-300">Strategic partnerships secured</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-300">Clear path to profitability</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isOpportunityInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 rounded-2xl p-8 transform hover:scale-105 transition-transform"
              >
                <Rocket className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Exponential Growth</h3>
                <p className="mb-6">
                  Our unique AI engine drives unprecedented engagement and success rates.
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">
                      <AnimatedCounter value={450} suffix="%" />
                    </div>
                    <div className="text-sm opacity-90">YoY Revenue Growth</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      <AnimatedCounter value={2.5} suffix="M" prefix="$" />
                    </div>
                    <div className="text-sm opacity-90">Monthly Recurring Revenue</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      <AnimatedCounter value={85} suffix="%" />
                    </div>
                    <div className="text-sm opacity-90">Success Rate</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={isOpportunityInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
              >
                <Award className="w-12 h-12 text-orange-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-white">Proven Team</h3>
                <p className="text-gray-300 mb-6">
                  Led by industry veterans with successful exits and deep domain expertise.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-400/20 mr-3 border-2 border-yellow-400 overflow-hidden">
                      <img 
                        src="/images/Elky.jpeg" 
                        alt="Elky Bachtiar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Elky Bachtiar</div>
                      <div className="text-sm text-gray-300">CEO & Founder, Ex-CTO Avazu</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-orange-400/20 mr-3 border-2 border-orange-400 overflow-hidden">
                      <img 
                        src="/images/Abiah-ai-co-founder.png" 
                        alt="Abiah AI" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Abiah</div>
                      <div className="text-sm text-gray-300">AI Co-Founder, 1B+ Parameters</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-3">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Nova</div>
                      <div className="text-sm text-gray-300">AI Innovation Director, 99.8% Accuracy</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section ref={testimonialsRef} className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isTestimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4 text-white">
                Trusted by <span className="text-yellow-400">Industry Leaders</span>
              </h2>
              <p className="text-xl text-gray-300">
                See why thousands of startups choose us for their growth journey
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isTestimonialsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors h-full">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold mr-4`}>
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Simple, Transparent Pricing Section - Transform Style */}
        <section ref={pricingRef} className="relative min-h-screen bg-gray-900 overflow-hidden">
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
              {pricingPlans.map((plan, index) => (
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

        {/* CTA Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <motion.div 
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(249, 185, 78, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(249, 185, 78, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(249, 185, 78, 0.15) 0%, transparent 50%)",
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              viewport={{ once: false, amount: 0.5 }}
            >
              <motion.h2 
                className="text-4xl md:text-5xl font-bold text-white mb-6"
                whileInView={{ 
                  background: ["linear-gradient(to right, #fff 0%, #fff 100%)", 
                            "linear-gradient(to right, #facc15 0%, #fb923c 100%)",
                            "linear-gradient(to right, #fff 0%, #fff 100%)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ 
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Ready to Transform Your Startup?
              </motion.h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of entrepreneurs already accelerating their growth with AI mentorship
              </p>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(249, 185, 78, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-lg rounded-full shadow-2xl transition-all duration-300"
                >
                  Start Your Journey Today
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Custom CSS for clip paths */}
        <style>{`
          .clip-path-triangle {
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          }
          .clip-path-hexagon {
            clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
          }
          .bg-grid-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }
        `}</style>
      </div>
    </>
  );
}