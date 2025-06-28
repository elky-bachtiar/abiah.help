import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { canStartConversation } from '../../api/subscriptionValidator';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { SubscriptionGuard } from '../subscription/SubscriptionGuard';
import { toast } from 'sonner';

interface SubscriptionRouteGuardProps {
  children: React.ReactNode;
  actionType?: 'conversation' | 'document_generation';
  estimatedDuration?: number;
  requiresSubscription?: boolean;
}

export function SubscriptionRouteGuard({
  children,
  actionType = 'conversation',
  estimatedDuration = 30,
  requiresSubscription = true
}: SubscriptionRouteGuardProps) {
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!requiresSubscription) {
      setIsValidating(false);
      setHasValidSubscription(true);
      return;
    }

    validateSubscription();
  }, [user, requiresSubscription]);

  const validateSubscription = async () => {
    if (!user) return;

    try {
      setIsValidating(true);
      const validation = await canStartConversation(user.id, estimatedDuration);
      
      if (validation.allowed) {
        setHasValidSubscription(true);
      } else {
        // Show upgrade prompt instead of immediately redirecting
        setShowUpgradePrompt(true);
        
        // Show toast with error messages
        if (validation.errors && validation.errors.length > 0) {
          validation.errors.forEach(error => {
            toast.error(error);
          });
        } else {
          toast.error('You need an active subscription to access this feature');
        }
      }
    } catch (error) {
      console.error('Error validating subscription:', error);
      toast.error('Failed to validate subscription. Please try again.');
      navigate('/dashboard');
    } finally {
      setIsValidating(false);
    }
  };

  const handleProceed = () => {
    // If user somehow proceeds (shouldn't be possible), redirect to dashboard
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-800">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white/80">Validating subscription...</p>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if subscription is invalid
  if (showUpgradePrompt && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <SubscriptionGuard
              userId={user.id}
              actionType={actionType}
              estimatedDuration={estimatedDuration}
              onProceed={handleProceed}
              onCancel={handleCancel}
              showUsageSummary={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // If subscription is valid, render children
  if (hasValidSubscription) {
    return <>{children}</>;
  }

  // Fallback redirect to dashboard
  return <Navigate to="/dashboard" replace />;
}