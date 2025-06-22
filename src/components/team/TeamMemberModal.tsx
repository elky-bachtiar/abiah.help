import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Linkedin, Twitter, Mail, GraduationCap, Calendar, Award } from 'lucide-react';
import { TeamMember } from '../../types/Team';
import { Button } from '../ui/Button-bkp';

interface TeamMemberModalProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamMemberModal({ member, isOpen, onClose }: TeamMemberModalProps) {
  // Use default image if none provided
  const imageUrl = member.image_url || '/images/Elky.jpeg';
  
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-20">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-text-secondary hover:text-primary transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image column */}
              <div className="relative">
                <div className="aspect-square md:h-full w-full">
                  <img 
                    src={imageUrl} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:bg-gradient-to-r flex items-end md:items-center p-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{member.name}</h2>
                    <p className="text-secondary font-medium">{member.role}</p>
                  </div>
                </div>
              </div>
              
              {/* Content column */}
              <div className="p-6 md:p-8 md:pt-12">
                {/* Bio */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-3">About</h3>
                  <p className="text-text-secondary whitespace-pre-line">{member.bio}</p>
                </div>
                
                {/* Details */}
                <div className="space-y-4 mb-6">
                  {member.education && (
                    <div className="flex items-start">
                      <GraduationCap className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">Education</h4>
                        <p className="text-text-secondary">{member.education}</p>
                      </div>
                    </div>
                  )}
                  
                  {member.years_experience > 0 && (
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">Experience</h4>
                        <p className="text-text-secondary">{member.years_experience} years</p>
                      </div>
                    </div>
                  )}
                  
                  {member.expertise_areas.length > 0 && (
                    <div className="flex items-start">
                      <Award className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">Expertise</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {member.expertise_areas.map((area, index) => (
                            <span 
                              key={index}
                              className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Contact */}
                <div className="pt-4 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-primary mb-4">Connect</h3>
                  <div className="flex flex-wrap gap-3">
                    {member.linkedin_url && (
                      <a 
                        href={member.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 rounded-lg bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    )}
                    
                    {member.twitter_url && (
                      <a 
                        href={member.twitter_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </a>
                    )}
                    
                    {member.email && (
                      <a 
                        href={`mailto:${member.email}`}
                        className="flex items-center px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}