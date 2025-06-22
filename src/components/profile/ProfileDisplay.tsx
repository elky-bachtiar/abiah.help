import React from 'react';
import { UserProfile } from '../../types/Profile';
import { Card, CardContent } from '../ui/Card';
import { formatDate } from '../../lib/utils';

interface ProfileDisplayProps {
  profile: UserProfile;
}

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
  return (
    <>
      {/* Personal Information */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Personal Information</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-1">Full Name</h4>
              <p className="text-text-primary">{profile.first_name} {profile.last_name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-1">Email Address</h4>
              <p className="text-text-primary">{profile.email}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {profile.phone && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-1">Phone Number</h4>
                <p className="text-text-primary">{profile.phone}</p>
              </div>
            )}
            
            {profile.location && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-1">Location</h4>
                <p className="text-text-primary">{profile.location}</p>
              </div>
            )}
          </div>
          
          {profile.bio && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Bio</h4>
              <p className="text-text-primary">{profile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Startup Details */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Startup Details</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {profile.startup_details.company_name && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-1">Company Name</h4>
                <p className="text-text-primary">{profile.startup_details.company_name}</p>
              </div>
            )}
            
            {profile.startup_details.industry && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-1">Industry</h4>
                <p className="text-text-primary">{profile.startup_details.industry}</p>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-1">Stage</h4>
              <p className="text-text-primary capitalize">{profile.startup_details.stage.replace('-', ' ')}</p>
            </div>
            
            {profile.startup_details.team_size && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-1">Team Size</h4>
                <p className="text-text-primary">{profile.startup_details.team_size} people</p>
              </div>
            )}
          </div>
          
          {profile.startup_details.funding_raised && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Funding Raised</h4>
              <p className="text-text-primary">${profile.startup_details.funding_raised.toLocaleString()}</p>
            </div>
          )}
          
          {profile.startup_details.founding_date && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Founded</h4>
              <p className="text-text-primary">{formatDate(profile.startup_details.founding_date)}</p>
            </div>
          )}
          
          {profile.startup_details.company_description && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Company Description</h4>
              <p className="text-text-primary">{profile.startup_details.company_description}</p>
            </div>
          )}
          
          {profile.startup_details.website_url && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Website</h4>
              <a 
                href={profile.startup_details.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                {profile.startup_details.website_url}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Professional Background */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Professional Background</h3>
          
          {profile.professional_background.current_title && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Current Title</h4>
              <p className="text-text-primary">{profile.professional_background.current_title}</p>
            </div>
          )}
          
          {profile.professional_background.previous_experience && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Previous Experience</h4>
              <p className="text-text-primary">{profile.professional_background.previous_experience}</p>
            </div>
          )}
          
          {profile.professional_background.skills.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-text-secondary mb-1">Skills</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.professional_background.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {profile.professional_background.achievements && profile.professional_background.achievements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-1">Achievements</h4>
              <ul className="list-disc list-inside text-text-primary">
                {profile.professional_background.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Communication Preferences */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Communication Preferences</h3>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-secondary mb-1">Communication Frequency</h4>
            <p className="text-text-primary capitalize">
              {profile.preferences.communication_frequency === 'high' && 'High (Multiple times per week)'}
              {profile.preferences.communication_frequency === 'medium' && 'Medium (Weekly updates)'}
              {profile.preferences.communication_frequency === 'low' && 'Low (Monthly updates)'}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${profile.preferences.consultation_reminders ? 'bg-success' : 'bg-neutral-300'}`} />
              <span className="text-text-primary">Consultation reminders</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${profile.preferences.marketing_emails ? 'bg-success' : 'bg-neutral-300'}`} />
              <span className="text-text-primary">Marketing emails and product updates</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}