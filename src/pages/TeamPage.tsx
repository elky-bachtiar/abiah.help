import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase } from 'lucide-react';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { JoinTeamRequest } from '../types/Team';
import { TeamGrid } from '../components/team/TeamGrid';
import { JoinTeamSection } from '../components/team/JoinTeamSection';

export function TeamPage() {
  const { members, isLoading, submitJoinTeamRequest } = useTeamMembers();
  
  const handleJoinTeamSubmit = async (data: JoinTeamRequest) => {
    await submitJoinTeamRequest(data);
  };
  
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Meet Our Team
          </h1>
          
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            We're a unique blend of human and AI expertise, dedicated to transforming startup mentorship 
            and helping founders succeed.
          </p>
        </motion.div>
        
        {/* Leadership Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center mb-8">
            <Briefcase className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-2xl font-bold text-primary">Leadership & Core Team</h2>
          </div>
          
          <TeamGrid 
            members={members.filter(m => m.display_order <= 3)} 
            isLoading={isLoading}
          />
        </motion.div>
        
        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="flex items-center mb-8">
            <Users className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-2xl font-bold text-primary">Our Team</h2>
          </div>
          
          <TeamGrid 
            members={members.filter(m => m.display_order > 3)} 
            isLoading={isLoading}
          />
        </motion.div>
        
        {/* Join Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          id="join-team"
        >
          <JoinTeamSection onSubmit={handleJoinTeamSubmit} />
        </motion.div>
      </div>
    </div>
  );
}