import { useState, useCallback } from 'react';
import { ContactFormData, SendEmailResponse } from '../types/Contact';
import { submitContactForm } from '../api/contactForm';

export function useContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const handleSubmit = useCallback(async (formData: ContactFormData): Promise<SendEmailResponse> => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const response = await submitContactForm(formData);
      
      setSubmitSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
      return response;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  return {
    isSubmitting,
    submitSuccess,
    submitError,
    handleSubmit
  };
}