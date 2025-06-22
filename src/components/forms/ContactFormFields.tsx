import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, AlertCircle } from 'lucide-react';
import { ContactFormData } from '../../types/Contact';
import { Button } from '../ui/Button-bkp';
import { Input } from '../ui/Input-bkp';

interface ContactFormFieldsProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  darkMode?: boolean;
}

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Please provide a message of at least 10 characters'),
  inquiry_type: z.enum(['general', 'investment', 'partnership', 'support', 'careers']),
  phone: z.string().optional(),
  preferred_contact_method: z.enum(['email', 'phone'])
});

type ContactFormFieldsData = z.infer<typeof contactFormSchema>;

export function ContactFormFields({ 
  onSubmit, 
  isSubmitting, 
  submitError, 
  submitSuccess,
  darkMode = false
}: ContactFormFieldsProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormFieldsData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      inquiry_type: 'general',
      preferred_contact_method: 'email'
    }
  });
  
  const handleFormSubmit = async (data: ContactFormFieldsData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error is handled by the parent component
    }
  };
  
  // Determine styling based on dark mode
  const inputClass = darkMode 
    ? "bg-white/10 border-white/20 text-white placeholder-white/50" 
    : "";
  
  const labelClass = darkMode
    ? "text-white"
    : "text-text-primary";
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {submitError && (
        <div className={`p-4 ${darkMode ? 'bg-error/20 border-error/30 text-white' : 'bg-error/10 border-error/20 text-error'} border rounded-lg flex items-center`}>
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{submitError}</p>
        </div>
      )}
      
      {submitSuccess && (
        <div className={`p-4 ${darkMode ? 'bg-success/20 border-success/30 text-white' : 'bg-success/10 border-success/20 text-success'} border rounded-lg flex items-center`}>
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>Your message has been sent successfully. We'll get back to you soon!</p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            error={errors.name?.message}
            {...register('name')}
            className={inputClass}
            labelClassName={labelClass}
          />
        </div>
        
        <div>
          <Input
            label="Email Address"
            placeholder="Enter your email address"
            error={errors.email?.message}
            {...register('email')}
            className={inputClass}
            labelClassName={labelClass}
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Company"
            placeholder="Enter your company name"
            error={errors.company?.message}
            {...register('company')}
            className={inputClass}
            labelClassName={labelClass}
          />
        </div>
        
        <div>
          <Input
            label="Role"
            placeholder="Enter your job title"
            error={errors.role?.message}
            {...register('role')}
            className={inputClass}
            labelClassName={labelClass}
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${labelClass} mb-1.5`}>
            Inquiry Type
          </label>
          <select
            {...register('inquiry_type')}
            className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              darkMode 
                ? 'bg-white/10 border-white/20 text-white' 
                : 'border-neutral-300 bg-white text-text-primary'
            }`}
          >
            <option value="general" className={darkMode ? 'bg-primary text-white' : ''}>General Inquiry</option>
            <option value="investment" className={darkMode ? 'bg-primary text-white' : ''}>Investment Opportunity</option>
            <option value="partnership" className={darkMode ? 'bg-primary text-white' : ''}>Partnership Proposal</option>
            <option value="support" className={darkMode ? 'bg-primary text-white' : ''}>Support Request</option>
            <option value="careers" className={darkMode ? 'bg-primary text-white' : ''}>Careers & Recruitment</option>
          </select>
          {errors.inquiry_type && (
            <p className="mt-1 text-sm text-error">{errors.inquiry_type.message}</p>
          )}
        </div>
        
        <div>
          <Input
            label="Subject (Optional)"
            placeholder="Enter message subject"
            error={errors.subject?.message}
            {...register('subject')}
            className={inputClass}
            labelClassName={labelClass}
          />
        </div>
      </div>
      
      <div>
        <label className={`block text-sm font-medium ${labelClass} mb-1.5`}>
          Message
        </label>
        <textarea
          {...register('message')}
          placeholder="Enter your message here..."
          className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32 resize-none ${
            darkMode 
              ? 'bg-white/10 border-white/20 text-white placeholder-white/50' 
              : 'border-neutral-300 bg-white text-text-primary placeholder-text-secondary'
          }`}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-error">{errors.message.message}</p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Phone Number (Optional)"
            placeholder="Enter your phone number"
            error={errors.phone?.message}
            {...register('phone')}
            className={inputClass}
            labelClassName={labelClass}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${labelClass} mb-1.5`}>
            Preferred Contact Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="email"
                {...register('preferred_contact_method')}
                className={`mr-2 ${darkMode ? 'text-secondary' : 'text-primary'}`}
              />
              <span className={darkMode ? 'text-white' : 'text-text-primary'}>Email</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="phone"
                {...register('preferred_contact_method')}
                className={`mr-2 ${darkMode ? 'text-secondary' : 'text-primary'}`}
              />
              <span className={darkMode ? 'text-white' : 'text-text-primary'}>Phone</span>
            </label>
          </div>
          {errors.preferred_contact_method && (
            <p className="mt-1 text-sm text-error">{errors.preferred_contact_method.message}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          variant={darkMode ? "secondary" : "primary"}
          size="lg"
          className="min-w-[200px]"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          <Send className="w-5 h-5 mr-2" />
          Send Message
        </Button>
      </div>
    </form>
  );
}