export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  role: string;
  subject?: string;
  message: string;
  inquiry_type: 'general' | 'investment' | 'partnership' | 'support' | 'careers';
  phone?: string;
  preferred_contact_method: 'email' | 'phone';
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}