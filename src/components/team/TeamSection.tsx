import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useTeamMembers } from '../../hooks/useTeamMembers';
import { TeamGrid } from './TeamGrid';

export function TeamSection() {
  const { members, isLoading } = useTeamMembers();
  
  return (
    <section className="py-20 bg-background-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Visionary Team
          </h2>
          
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Human + AI Collaboration
          </p>
        </motion.div>
        
        <TeamGrid 
          members={members} 
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}