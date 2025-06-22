import React from 'react';
import { motion } from 'framer-motion';
import { TeamMember } from '../../types/Team';
import { TeamCard } from './TeamCard';
import { TeamMemberModal } from './TeamMemberModal';

interface TeamGridProps {
  members: TeamMember[];
  isLoading: boolean;
}

export function TeamGrid({ members, isLoading }: TeamGridProps) {
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);
  
  // Sort members by display_order
  const sortedMembers = React.useMemo(() => {
    return [...members].sort((a, b) => a.display_order - b.display_order);
  }, [members]);
  
  const handleSelectMember = (member: TeamMember) => {
    setSelectedMember(member);
  };
  
  const handleCloseModal = () => {
    setSelectedMember(null);
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden h-full animate-pulse">
            <div className="aspect-square bg-neutral-200" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
              <div className="h-4 bg-neutral-200 rounded w-full" />
              <div className="h-4 bg-neutral-200 rounded w-full" />
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="flex gap-2 mt-4">
                <div className="h-8 w-8 bg-neutral-200 rounded-full" />
                <div className="h-8 w-8 bg-neutral-200 rounded-full" />
                <div className="h-8 w-8 bg-neutral-200 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-primary mb-2">No team members found</h3>
        <p className="text-text-secondary">Please check back later for updates.</p>
      </div>
    );
  }
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {sortedMembers.map((member) => (
          <TeamCard 
            key={member.id} 
            member={member} 
            onClick={handleSelectMember}
          />
        ))}
      </motion.div>
      
      {selectedMember && (
        <TeamMemberModal
          member={selectedMember}
          isOpen={!!selectedMember}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}