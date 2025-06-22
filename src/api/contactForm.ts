import { ContactFormData, SendEmailResponse } from '../types/Contact';
import { callEdgeFunction } from '../lib/supabase';

/**
 * Submit contact form data to the send-email Edge Function
 * @param formData Contact form data
 * @returns Promise with response data
 */
export const submitContactForm = async (formData: ContactFormData): Promise<SendEmailResponse> => {
  try {
    // Format the data for the send-email Edge Function
    const emailData = {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      role: formData.role,
      subject: formData.subject || `New ${formData.inquiry_type} inquiry from ${formData.name}`,
      message: formData.message,
      investmentInterest: formData.inquiry_type === 'investment' ? 'Yes' : 'No',
      phone: formData.phone || 'Not provided',
      preferred_contact_method: formData.preferred_contact_method
    };
    
    // Call the send-email Edge Function
    const response = await callEdgeFunction<SendEmailResponse>('send-email', emailData);
    
    if (!response) {
      throw new Error('Failed to send email. Please try again later.');
    }
    
    return response;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to submit contact form');
  }
};