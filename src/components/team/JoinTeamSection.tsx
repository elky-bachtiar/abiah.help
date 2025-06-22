import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { JoinTeamRequest } from '../../types/Team';
import { Button } from '../ui/Button-bkp';
import { Input } from '../ui/Input-bkp';
import { Card, CardContent } from '../ui/Card';

interface JoinTeamSectionProps {
  onSubmit: (data: JoinTeamRequest) => Promise<void>;
}

const joinTeamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  role: z.string().min(1, 'Role is required'),
  resume_url: z.string().optional(),
  message: z.string().min(10, 'Please provide a brief message about why you want to join'),
  linkedin_url: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal(''))
});

type JoinTeamFormData = z.infer<typeof joinTeamSchema>;

export function JoinTeamSection({ onSubmit }: JoinTeamSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<JoinTeamFormData>({
    resolver: zodResolver(joinTeamSchema)
  });
  
  const handleFormSubmit = async (data: JoinTeamFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      await onSubmit(data);
      
      setSubmitSuccess(true);
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-br from-primary to-primary-800 rounded-xl overflow-hidden"
    >
      <div className="p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Our Team
          </h2>
          <p className="text-white/80 text-lg">
            We're looking for exceptional talent to help us transform startup mentorship through AI. 
            If you're passionate about AI, startups, and making a difference, we'd love to hear from you.
          </p>
        </div>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-6">
            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
                <p className="text-white/80 mb-6">
                  Thank you for your interest in joining our team. We'll review your application and get back to you soon.
                </p>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary"
                  onClick={() => setSubmitSuccess(false)}
                >
                  Submit Another Application
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {submitError && (
                  <div className="p-4 bg-error/20 border border-error/30 rounded-lg flex items-center text-white mb-6">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <p>{submitError}</p>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
                      error={errors.name?.message}
                      {...register('name')}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Email Address"
                      placeholder="Enter your email address"
                      error={errors.email?.message}
                      {...register('email')}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Role You're Interested In"
                      placeholder="e.g., AI Engineer, Product Manager"
                      error={errors.role?.message}
                      {...register('role')}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="LinkedIn Profile (Optional)"
                      placeholder="https://linkedin.com/in/yourprofile"
                      error={errors.linkedin_url?.message}
                      {...register('linkedin_url')}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Why do you want to join Abiah.help?
                  </label>
                  <textarea
                    {...register('message')}
                    placeholder="Tell us about your interest in AI mentorship and what you can bring to our team..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent h-32 resize-none"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-300">{errors.message.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Resume/CV (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-white/70" />
                        <p className="mb-2 text-sm text-white/70">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-white/50">PDF, DOCX or TXT (MAX. 5MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.docx,.doc,.txt"
                        {...register('resume_url')}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    className="min-w-[200px]"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Application
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}