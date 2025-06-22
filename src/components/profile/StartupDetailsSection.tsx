import React from 'react';
import { StartupDetails } from '../../types/Profile';
import { Card, CardContent } from '../ui/Card';

interface StartupDetailsSectionProps {
  details: StartupDetails;
  isEditMode: boolean;
}

export function StartupDetailsSection({ details, isEditMode }: StartupDetailsSectionProps) {
  if (isEditMode) {
    return null; // When in edit mode, this is handled by ProfileEditForm
  }
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Startup Details</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {details.company_name && (
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-1">Company Name</h4>
              <p className="text-text-primary">{details.company_name}</p>
            </div>
          )}
          
          {details.industry && (
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-1">Industry</h4>
              <p className="text-text-primary">{details.industry}</p>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-1">Stage</h4>
            <p className="text-text-primary capitalize">{details.stage.replace('-', ' ')}</p>
          </div>
          
          {details.team_size && (
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-1">Team Size</h4>
              <p className="text-text-primary">{details.team_size} people</p>
            </div>
          )}
        </div>
        
        {details.funding_raised && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-text-secondary mb-1">Funding Raised</h4>
            <p className="text-text-primary">${details.funding_raised.toLocaleString()}</p>
          </div>
        )}
        
        {details.founding_date && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-text-secondary mb-1">Founded</h4>
            <p className="text-text-primary">{new Date(details.founding_date).toLocaleDateString()}</p>
          </div>
        )}
        
        {details.company_description && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-text-secondary mb-1">Company Description</h4>
            <p className="text-text-primary">{details.company_description}</p>
          </div>
        )}
        
        {details.website_url && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-text-secondary mb-1">Website</h4>
            <a 
              href={details.website_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {details.website_url}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}