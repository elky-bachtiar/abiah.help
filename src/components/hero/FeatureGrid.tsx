import React from 'react';
import { motion } from 'framer-motion';
import { Video, FileText, BarChart3, Users, Shield, Zap } from 'lucide-react'; 

const features = [
  {
    id: 1,
    icon: Video,
    title: 'AI Video Consultations',
    description: 'Face-to-face mentorship with industry-specific AI experts trained on successful funding strategies.',
    color: 'bg-blue-500',
  },
  {
    id: 2,
    icon: FileText,
    title: 'Document Generation',
    description: 'Automatically generate pitch decks, business plans, and financial projections tailored to your startup.', 
    color: 'bg-green-500',
  },
  {
    id: 3,
    icon: BarChart3,
    title: 'Funding Analytics',
    description: 'Track your funding readiness score and get actionable insights to improve your chances.',
    color: 'bg-purple-500',
  },
  {
    id: 4,
    icon: Users,
    title: 'Expert Network',
    description: 'Access specialized mentors for FinTech, HealthTech, and other industry verticals.', 
    color: 'bg-orange-500',
  },
  {
    id: 5,
    icon: Shield,
    title: 'Funding Readiness',
    description: 'Get investor-ready with tailored pitch decks, business plans, and actionable feedback from your AI mentor.',
    color: 'bg-red-500',
  },
  {
    id: 6,
    icon: Zap,
    title: 'Real-time Guidance',
    description: 'Get instant feedback and recommendations during consultations and document creation.', 
    color: 'bg-yellow-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function FeatureGrid() {
  return (
    <div className="py-20">
      <div className="text-center mb-16">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Everything You Need to Get Funded
        </motion.h2>
        <motion.p 
          className="text-xl text-blue-100 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Our comprehensive platform combines AI mentorship, document generation, and analytics 
          to maximize your funding success.
        </motion.p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 h-full hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-secondary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-blue-100 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}