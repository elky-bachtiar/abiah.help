import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { canStartConversation, canGenerateDocument } from '../api/subscriptionValidator';
import { toast } from 'sonner';

interface SubscriptionCheckResult {
  isChecking: boolean;
  checkConversationAccess: (estimatedDuration?: number) => Promise<boolean>;
  checkDocumentAccess: (documentType: string, estimatedTokens?: number) => Promise<boolean>;
  navigateWithSubscriptionCheck: (
    path: string,
    actionType: 'conversation' | 'document_generation',
    options?: { estimatedDuration?: number; documentType?: string; estimatedTokens?: number }
  ) => Promise<void>;
}

export function useSubscriptionCheck(): SubscriptionCheckResult {
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  const checkConversationAccess = useCallback(async (estimatedDuration: number = 30): Promise<boolean> => {
    if (!user) {
      toast.error('Please log in to access consultations');
      navigate('/login');
      return false;
    }

    try {
      setIsChecking(true);
      const validation = await canStartConversation(user.id, estimatedDuration);
      
      if (!validation.allowed) {
        // Show specific error messages
        if (validation.errors && validation.errors.length > 0) {
          validation.errors.forEach(error => toast.error(error));
        } else {
          toast.error('You need an active subscription to start a consultation');
        }
        
        // Show upgrade prompt
        if (validation.upgrade_required) {
          toast.info('Upgrade your plan to access this feature', {
            action: {
              label: 'View Plans',
              onClick: () => navigate('/pricing')
            }
          });
        }
      }
      
      return validation.allowed;
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to validate subscription. Please try again.');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [user, navigate]);

  const checkDocumentAccess = useCallback(async (
    documentType: string,
    estimatedTokens: number = 2000
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Please log in to generate documents');
      navigate('/login');
      return false;
    }

    try {
      setIsChecking(true);
      const validation = await canGenerateDocument(user.id, documentType, estimatedTokens);
      
      if (!validation.allowed) {
        // Show specific error messages
        if (validation.errors && validation.errors.length > 0) {
          validation.errors.forEach(error => toast.error(error));
        } else {
          toast.error('You need an active subscription to generate documents');
        }
        
        // Show upgrade prompt
        if (validation.upgrade_required) {
          toast.info('Upgrade your plan to generate more documents', {
            action: {
              label: 'View Plans',
              onClick: () => navigate('/pricing')
            }
          });
        }
      }
      
      return validation.allowed;
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to validate subscription. Please try again.');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [user, navigate]);

  const navigateWithSubscriptionCheck = useCallback(async (
    path: string,
    actionType: 'conversation' | 'document_generation',
    options: { estimatedDuration?: number; documentType?: string; estimatedTokens?: number } = {}
  ): Promise<void> => {
    let hasAccess = false;

    if (actionType === 'conversation') {
      hasAccess = await checkConversationAccess(options.estimatedDuration);
    } else if (actionType === 'document_generation' && options.documentType) {
      hasAccess = await checkDocumentAccess(options.documentType, options.estimatedTokens);
    }

    if (hasAccess) {
      navigate(path);
    } else {
      // If no access, stay on current page or redirect to subscription page
      // The error messages are already shown by the check functions
      navigate('/subscription');
    }
  }, [checkConversationAccess, checkDocumentAccess, navigate]);

  return {
    isChecking,
    checkConversationAccess,
    checkDocumentAccess,
    navigateWithSubscriptionCheck
  };
}