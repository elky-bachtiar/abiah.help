import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserProfile, ProfileUpdateRequest } from '../../types/Profile';
import { Input } from '../ui/Input-bkp';
import { Card, CardContent } from '../ui/Card';

interface ProfileEditFormProps {
  profile: UserProfile;
  onUpdate: (updates: ProfileUpdateRequest) => Promise<void>;
}

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  
  // Startup details
  company_name: z.string().optional(),
  company_description: z.string().optional(),
  industry: z.string().optional(),
  stage: z.enum(['idea', 'pre-seed', 'seed', 'series-a', 'series-b', 'growth']),
  team_size: z.number().int().positive().optional(),
  funding_raised: z.number().nonnegative().optional(),
  founding_date: z.string().optional(),
  website_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  
  // Professional background
  current_title: z.string().optional(),
  previous_experience: z.string().optional(),
  skills: z.string().optional(),
  achievements: z.string().optional(),
  
  // Preferences
  communication_frequency: z.enum(['high', 'medium', 'low']),
  consultation_reminders: z.boolean(),
  marketing_emails: z.boolean()
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileEditForm({ profile, onUpdate }: ProfileEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone || '',
      bio: profile.bio || '',
      location: profile.location || '',
      timezone: profile.timezone || '',
      
      // Startup details
      company_name: profile.startup_details.company_name || '',
      company_description: profile.startup_details.company_description || '',
      industry: profile.startup_details.industry || '',
      stage: profile.startup_details.stage,
      team_size: profile.startup_details.team_size || undefined,
      funding_raised: profile.startup_details.funding_raised || undefined,
      founding_date: profile.startup_details.founding_date || '',
      website_url: profile.startup_details.website_url || '',
      
      // Professional background
      current_title: profile.professional_background.current_title || '',
      previous_experience: profile.professional_background.previous_experience || '',
      skills: profile.professional_background.skills.join(', '),
      achievements: profile.professional_background.achievements?.join(', ') || '',
      
      // Preferences
      communication_frequency: profile.preferences.communication_frequency,
      consultation_reminders: profile.preferences.consultation_reminders,
      marketing_emails: profile.preferences.marketing_emails
    }
  });
  
  const onFormSubmit = async (data: ProfileFormData) => {
    // Transform form data to ProfileUpdateRequest
    const updates: ProfileUpdateRequest = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      bio: data.bio,
      location: data.location,
      timezone: data.timezone,
      
      startup_details: {
        company_name: data.company_name,
        company_description: data.company_description,
        industry: data.industry,
        stage: data.stage,
        team_size: data.team_size,
        funding_raised: data.funding_raised,
        founding_date: data.founding_date,
        website_url: data.website_url
      },
      
      professional_background: {
        current_title: data.current_title,
        previous_experience: data.previous_experience,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
        achievements: data.achievements ? data.achievements.split(',').map(a => a.trim()) : []
      },
      
      preferences: {
        communication_frequency: data.communication_frequency,
        consultation_reminders: data.consultation_reminders,
        marketing_emails: data.marketing_emails
      }
    };
    
    await onUpdate(updates);
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {/* Personal Information */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Personal Information</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              {...register('first_name')}
              error={errors.first_name?.message}
            />
            
            <Input
              label="Last Name"
              {...register('last_name')}
              error={errors.last_name?.message}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <Input
              label="Email Address"
              {...register('email')}
              error={errors.email?.message}
              disabled
            />
            
            <Input
              label="Phone Number"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Bio
            </label>
            <textarea
              {...register('bio')}
              className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32 resize-none"
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-error">{errors.bio.message}</p>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <Input
              label="Location"
              {...register('location')}
              error={errors.location?.message}
              placeholder="e.g., San Francisco, CA"
            />
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Timezone
              </label>
              <select
                {...register('timezone')}
                className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Timezone</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Central European Time (CET)</option>
                <option value="Asia/Singapore">Singapore Time (SGT)</option>
                <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
              </select>
              {errors.timezone && (
                <p className="mt-1 text-sm text-error">{errors.timezone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Startup Details */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Startup Details</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Company Name"
              {...register('company_name')}
              error={errors.company_name?.message}
            />
            
            <Input
              label="Website URL"
              {...register('website_url')}
              error={errors.website_url?.message}
              placeholder="https://example.com"
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Company Description
            </label>
            <textarea
              {...register('company_description')}
              className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32 resize-none"
              placeholder="Describe your startup..."
            />
            {errors.company_description && (
              <p className="mt-1 text-sm text-error">{errors.company_description.message}</p>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <Input
              label="Industry"
              {...register('industry')}
              error={errors.industry?.message}
              placeholder="e.g., FinTech, HealthTech, SaaS"
            />
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Stage
              </label>
              <select
                {...register('stage')}
                className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="idea">Idea Stage</option>
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B</option>
                <option value="growth">Growth Stage</option>
              </select>
              {errors.stage && (
                <p className="mt-1 text-sm text-error">{errors.stage.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <Input
              label="Team Size"
              type="number"
              {...register('team_size', { valueAsNumber: true })}
              error={errors.team_size?.message}
            />
            
            <Input
              label="Funding Raised ($)"
              type="number"
              {...register('funding_raised', { valueAsNumber: true })}
              error={errors.funding_raised?.message}
            />
          </div>
          
          <div className="mt-4">
            <Input
              label="Founding Date"
              type="date"
              {...register('founding_date')}
              error={errors.founding_date?.message}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Professional Background */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Professional Background</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Current Title"
              {...register('current_title')}
              error={errors.current_title?.message}
              placeholder="e.g., Founder & CEO"
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Previous Experience
            </label>
            <textarea
              {...register('previous_experience')}
              className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32 resize-none"
              placeholder="Describe your previous roles and experience..."
            />
            {errors.previous_experience && (
              <p className="mt-1 text-sm text-error">{errors.previous_experience.message}</p>
            )}
          </div>
          
          <div className="mt-4">
            <Input
              label="Skills (comma-separated)"
              {...register('skills')}
              error={errors.skills?.message}
              placeholder="e.g., AI, Product Management, Growth Marketing"
            />
          </div>
          
          <div className="mt-4">
            <Input
              label="Achievements (comma-separated)"
              {...register('achievements')}
              error={errors.achievements?.message}
              placeholder="e.g., Raised $2M seed round, Grew team to 20 people"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Preferences */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Communication Preferences</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Communication Frequency
            </label>
            <select
              {...register('communication_frequency')}
              className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="high">High (Multiple times per week)</option>
              <option value="medium">Medium (Weekly updates)</option>
              <option value="low">Low (Monthly updates)</option>
            </select>
            {errors.communication_frequency && (
              <p className="mt-1 text-sm text-error">{errors.communication_frequency.message}</p>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="consultation_reminders"
                {...register('consultation_reminders')}
                className="rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <label htmlFor="consultation_reminders" className="ml-2 text-text-primary">
                Receive consultation reminders
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="marketing_emails"
                {...register('marketing_emails')}
                className="rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <label htmlFor="marketing_emails" className="ml-2 text-text-primary">
                Receive marketing emails and product updates
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}