import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Mail, ChevronRight } from 'lucide-react';
import { TeamMember } from '../../types/Team';
import { Button } from '../ui/Button-bkp';

interface TeamCardProps {
  member: TeamMember;
  onClick: (member: TeamMember) => void;
}

export function TeamCard({ member, onClick }: TeamCardProps) {
  // Use default image if none provided
  const imageUrl = member.image_url || '/images/Elky.jpeg';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-full"
    >
      <div className="aspect-square overflow-hidden bg-neutral-100">
        <img 
          src={imageUrl} 
          alt={member.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-primary mb-1">{member.name}</h3>
        <p className="text-secondary font-medium mb-3">{member.role}</p>
        
        <div className="mb-4">
          <p className="text-text-secondary line-clamp-3">{member.bio}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {member.expertise_areas.slice(0, 3).map((area, index) => (
            <span 
              key={index}
              className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
            >
              {area}
            </span>
          ))}
          {member.expertise_areas.length > 3 && (
            <span className="inline-block px-2 py-1 bg-neutral-100 text-text-secondary text-xs rounded-full">
              +{member.expertise_areas.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {member.linkedin_url && (
              <a 
                href={member.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-neutral-100 hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
                aria-label={`${member.name}'s LinkedIn profile`}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            
            {member.twitter_url && (
              <a 
                href={member.twitter_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-neutral-100 hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
                aria-label={`${member.name}'s Twitter profile`}
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            
            {member.email && (
              <a 
                href={`mailto:${member.email}`}
                className="p-2 rounded-full bg-neutral-100 hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
                aria-label={`Email ${member.name}`}
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onClick(member)}
            className="text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            View Profile
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}