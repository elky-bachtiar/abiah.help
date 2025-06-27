import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Zap, Shield, TrendingUp, ChevronDown, Star, Check, Globe, Rocket, Brain, MessageSquare, Clock, Award, Target, X, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { HeroSection } from '../components/hero/HeroSection';
import { TeamSection } from '../components/team/TeamSection';
import { PricingSection } from '../components/pricing/PricingSection';
import { StickyBoltLogo } from '../components/common/StickyBoltLogo';
import { AnimatedBackground, FloatingOrbs, ParticleField, Card3D } from '../components/effects';


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

export function Home() {
  const navigate = useNavigate();
  const [videoPlaying, setVideoPlaying] = useState(false);
  
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
  
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background overflow-hidden">
      <AnimatedBackground />
      <ParticleField particleCount={100} opacity={0.5} connectionDistance={100} />
      
      {/* Enhanced Hero Section with Particles */}
      <div className="relative">
        <FloatingOrbs orbCount={6} />
        <HeroSection />
      </div>
      
      {/* For Investors Section (from main2) */}
      <section className="py-24 bg-gradient-to-b from-background to-primary-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6">For <span className="text-primary">Investors</span></h2>
              <p className="text-xl mb-8 text-text-secondary">
                Abiah represents a $50B opportunity in the rapidly growing AI mentorship market. Our proprietary technology delivers measurable results for startups.  
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-primary mb-2">
                    <AnimatedCounter value={450} suffix="%" />
                  </div>
                  <div className="text-text-secondary">YoY Growth</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-secondary mb-2">
                    <AnimatedCounter value={92} suffix="%" />
                  </div>
                  <div className="text-text-secondary">Customer Retention</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    <AnimatedCounter value={75} suffix="M+" />
                  </div>
                  <div className="text-text-secondary">Total Capital Raised</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    <AnimatedCounter value={5} suffix="x" />
                  </div>
                  <div className="text-text-secondary">ROI for Partners</div>
                </div>
              </div>
              
              <Link to="/pitchdeck" style={{ textDecoration: 'none' }}>
  <Button size="lg" variant="secondary" className="group">
    <span>View Investor Deck</span>
    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
  </Button>
</Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary to-secondary p-1 rounded-2xl shadow-2xl rotate-3 hidden lg:block">
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Market Opportunity</h3>
                  <div className="mt-8 flex flex-col space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Check size={20} className="text-green-600" />
                      </div>
                      <div>Only 2% of startups have access to quality mentorship</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Check size={20} className="text-green-600" />
                      </div>
                      <div>83% of startups fail within the first 3 years</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Check size={20} className="text-green-600" />
                      </div>
                      <div>Mentored startups grow 3.5x faster than non-mentored</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mr-3">
                        <Users size={20} className="text-secondary" />
                      </div>
                      <div>
                        <div className="font-medium">3.2M Underserved Startups</div>
                        <div className="text-sm text-text-secondary">In our target markets</div>
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
                            target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-text-secondary font-medium">Growth Projection Chart</div>';
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

      {/* Built for Scale, Designed for Impact Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Built for <span className="text-primary">Scale</span>,{' '}
              Designed for <span className="text-secondary">Impact</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature engineered to deliver exceptional experiences and measurable results
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card3D className="h-full">
                  <div className="relative h-full bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-300 group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 rounded-2xl transition-opacity`} />
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* The $50B Opportunity Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div
          initial={{ opacity: 0.1 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl"
        />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">
              The <span className="text-primary">$50B</span> Opportunity
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto mb-12">
              AI-powered conversations are revolutionizing how businesses connect with customers. 
              We're at the forefront of this transformation.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50"
            >
              <Target className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">Market Leadership</h3>
              <p className="text-muted-foreground mb-6">
                Positioned to capture 15% of the conversational AI market by 2026 with our unique approach to personalization.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Patent-pending technology</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Strategic partnerships secured</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Clear path to profitability</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-gradient-to-br from-primary to-secondary text-white rounded-2xl p-8 transform hover:scale-105 transition-transform"
            >
              <Rocket className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Exponential Growth</h3>
              <p className="mb-6">
                Our unique AI engine drives unprecedented engagement and conversion rates.
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
                  <div className="text-sm opacity-90">Gross Margin</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50"
            >
              <Award className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-2xl font-bold mb-4">Proven Team</h3>
              <p className="text-muted-foreground mb-6">
                Led by industry veterans with successful exits and deep domain expertise.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 mr-3 border-2 border-primary overflow-hidden">
                    <img 
                      src="/images/Elky.jpeg" 
                      alt="Elky Bachtiar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">Elky Bachtiar</div>
                    <div className="text-sm text-muted-foreground">CEO & Founder, Ex-CTO Avazu</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 mr-3 border-2 border-secondary overflow-hidden">
                    <img 
                      src="/images/Abiah-ai-co-founder.png" 
                      alt="Abiah AI" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">Abiah</div>
                    <div className="text-sm text-muted-foreground">AI Co-Founder, 1B+ Parameters</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center mr-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Nova</div>
                    <div className="text-sm text-muted-foreground">AI Innovation Director, 99.8% Accuracy</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Trusted by Industry Leaders Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Trusted by <span className="text-primary">Industry Leaders</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See why thousands of companies choose us for their AI needs
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card3D className="h-full">
                  <div className="relative h-full bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center mr-3 shadow-lg`}>
                        <span className="text-sm font-bold text-white">{testimonial.avatar}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <PricingSection hideSupport={true} />
      
      {/* Ready to Transform Your Business Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl p-12 text-white text-center overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            />
            
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join the AI revolution today. Start your free trial and see results in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/get-started')}
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate('/contact-sales')}
                >
                  Contact Sales
                </Button>
              </div>
              
              <p className="mt-6 text-sm opacity-75">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Video Modal */}
      <AnimatePresence>
        {videoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full aspect-video bg-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src="/demo-video.mp4"
                controls
                autoPlay
                className="w-full h-full"
              />
              <button
                onClick={() => setVideoPlaying(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sticky Bolt Logo */}
      <StickyBoltLogo position="bottom-right" />
    </div>
  );
}