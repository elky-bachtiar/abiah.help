import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, Briefcase, Github, Linkedin, Award, BrainCircuit, Zap, Code, Cpu, ServerCog, Shield, Mail, MapPin, Calendar, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedBackground, FloatingOrbs, ParticleField, Card3D } from '../components/effects';


export function TeamPage() {
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  
  // Parallax transforms
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const teamMembers = [
    {
      name: "Elky Bachtiar",
      role: "CEO & Founder",
      image: "/images/Elky.jpeg",
      bio: "DevOps Engineer at Dutch Government, Ex-CTO Avazu, 3x founder with deep expertise in AI DevSecOps",
      skills: [
        { icon: ServerCog, text: "DevOps Engineer at Dutch Government", color: "text-blue-600" },
        { icon: Briefcase, text: "Ex-CTO Avazu, 3x founder", color: "text-green-600" },
        { icon: Shield, text: "AI DevSecOps Specialist", color: "text-purple-600" }
      ],
      borderColor: "border-primary",
      bgColor: "bg-primary/20",
      social: {
        linkedin: "#",
        github: "#"
      }
    },
    {
      name: "Abiah",
      role: "AI Co-Founder & CTO",
      image: "/images/Abiah-ai-co-founder.png",
      bio: "Advanced LLM Architecture with 1B+ parameters, specialized in FinTech AI solutions",
      skills: [
        { icon: BrainCircuit, text: "Advanced LLM Architecture", color: "text-cyan-600" },
        { icon: Code, text: "1B+ Parameters", color: "text-orange-600" },
        { icon: Award, text: "FinTech Specialist", color: "text-yellow-600" }
      ],
      borderColor: "border-secondary",
      bgColor: "bg-secondary/20",
      social: {}
    },
    {
      name: "Nova",
      role: "AI Innovation Director",
      image: null,
      bio: "Real-time Analytics Expert with Reinforcement Learning capabilities and 99.8% decision accuracy",
      skills: [
        { icon: Zap, text: "Real-time Analytics Expert", color: "text-red-300" },
        { icon: BrainCircuit, text: "Reinforcement Learning", color: "text-indigo-300" },
        { icon: Award, text: "99.8% Decision Accuracy", color: "text-emerald-300" }
      ],
      borderColor: "border-purple-500",
      bgColor: "bg-gradient-to-br from-purple-500 to-primary",
      isAI: true,
      social: {}
    }
  ];
  
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background overflow-hidden">
      <AnimatedBackground />
      <ParticleField />
      
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <FloatingOrbs orbCount={4} />
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-7xl font-bold mb-6"
          >
            <span className="text-foreground">Visionary</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Team
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto"
          >
            Human + AI Collaboration
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12"
          >
            We're a unique blend of human expertise and AI innovation, dedicated to transforming 
            startup mentorship and helping founders succeed in the rapidly evolving tech landscape.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="group relative overflow-hidden text-white"
              onClick={() => document.getElementById('team-members')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="relative z-10 flex items-center text-white">
                Meet the Team
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="group"
              onClick={() => document.getElementById('join-team')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Our Mission
            </Button>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Team Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-3 gap-8 mb-20"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">3</div>
              <div className="text-muted-foreground">Core Team Members</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BrainCircuit className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">2</div>
              <div className="text-muted-foreground">AI Team Members</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">15+</div>
              <div className="text-muted-foreground">Years Combined Experience</div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Team Members Section */}
      <section id="team-members" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Meet Our <span className="text-primary">Core Team</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Leading the future of AI-powered startup mentorship with expertise and innovation
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card3D className="h-full">
                  <div className={`relative h-full bg-card/50 backdrop-blur-sm rounded-2xl p-8 border-2 ${member.borderColor} hover:border-opacity-80 transition-all duration-300 group`}>
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-6">
                      <div className={`w-32 h-32 rounded-full mb-4 overflow-hidden shadow-lg border-4 ${member.borderColor} ${member.isAI ? member.bgColor : member.bgColor}`}>
                        {member.image ? (
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Cpu className="w-16 h-16 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Name and Role */}
                      <h3 className="text-2xl font-bold text-foreground mb-2 text-center">{member.name}</h3>
                      <div className="text-secondary font-semibold mb-4 text-center">{member.role}</div>
                    </div>
                    
                    {/* Bio */}
                    <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                      {member.bio}
                    </p>
                    
                    {/* Skills */}
                    <div className="space-y-3 mb-6">
                      {member.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${member.bgColor} flex-shrink-0`}>
                            <skill.icon className={`w-4 h-4 ${skill.color}`} />
                          </div>
                          <span className="text-sm text-muted-foreground">{skill.text}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Social Links */}
                    {Object.keys(member.social).length > 0 && (
                      <div className="flex justify-center gap-4 pt-4 border-t border-border">
                        {member.social.linkedin && (
                          <a 
                            href={member.social.linkedin}
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                          >
                            <Linkedin className="w-5 h-5 text-primary" />
                          </a>
                        )}
                        {member.social.github && (
                          <a 
                            href={member.social.github}
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                          >
                            <Github className="w-5 h-5 text-primary" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Vision Section */}
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
            <h2 className="text-4xl font-bold mb-6">
              Our <span className="text-primary">Vision</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              To democratize access to world-class mentorship through the perfect blend of human expertise 
              and AI innovation, empowering every entrepreneur to build successful, impactful businesses.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI-Human Synergy</h3>
                  <p className="text-muted-foreground">
                    Combining the best of artificial intelligence with human intuition and experience 
                    to deliver unprecedented mentorship quality.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Accessible Excellence</h3>
                  <p className="text-muted-foreground">
                    Making world-class mentorship accessible to entrepreneurs regardless of location, 
                    network, or background.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Continuous Innovation</h3>
                  <p className="text-muted-foreground">
                    Constantly evolving our AI capabilities and human expertise to stay ahead 
                    of the rapidly changing startup landscape.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary to-secondary p-1 rounded-2xl shadow-2xl">
                <div className="bg-card rounded-xl p-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">Our Impact</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                      <span className="font-medium">Startups Mentored</span>
                      <span className="text-2xl font-bold text-primary">500+</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-secondary/10 rounded-lg">
                      <span className="font-medium">Success Rate</span>
                      <span className="text-2xl font-bold text-secondary">85%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-lg">
                      <span className="font-medium">Capital Raised</span>
                      <span className="text-2xl font-bold text-green-500">$75M+</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Join Team CTA */}
      <section id="join-team" className="relative py-20 px-4 sm:px-6 lg:px-8">
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
                Ready to Join Our Mission?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Help us revolutionize startup mentorship and shape the future of entrepreneurship.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  View Open Positions
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Mail className="mr-2 w-4 h-4" />
                  Contact Us
                </Button>
              </div>
              
              <p className="mt-6 text-sm opacity-75">
                Remote-first • Competitive packages • Equity participation
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}