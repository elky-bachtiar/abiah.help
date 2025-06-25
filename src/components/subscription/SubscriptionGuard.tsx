import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Video, 
  FileText, 
  Zap,
  ArrowUp,
  X
} from 'lucide-react';
import { Button } from '../ui/Button-bkp';
import { Card, CardContent } from '../ui/Card';
import { ValidationResponse, getUserUsageSummary, getUpgradeSuggestions } from '../../api/subscriptionValidator';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface SubscriptionGuardProps {
  userId: string;
  actionType: 'conversation' | 'document_generation';
  estimatedDuration?: number;
  estimatedTokens?: number;
  documentType?: string;
  onProceed: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  showUsageSummary?: boolean;
}

export function SubscriptionGuard({
  userId,
  actionType,
  estimatedDuration = 30,
  estimatedTokens = 2000,
  documentType,
  onProceed,
  onCancel,
  children,
  showUsageSummary = true
}: SubscriptionGuardProps) {
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeDetails, setShowUpgradeDetails] = useState(false);

  useEffect(() => {
    loadUsageValidation();
  }, [userId, actionType, estimatedDuration, estimatedTokens]);

  const loadUsageValidation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const validationResult = await getUserUsageSummary(userId);
      setValidation(validationResult);
    } catch (err) {
      console.error('Error loading usage validation:', err);
      setError('Failed to load subscription information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (validation?.allowed) {
      onProceed();
    }
  };

  const renderUsageSummary = (validation: ValidationResponse) => {
    const usageItems = [
      {
        icon: Video,
        label: 'Video Sessions',
        used: validation.current_usage.sessions_used,
        limit: validation.limits.max_sessions,
        remaining: validation.remaining.sessions,
        unit: 'sessions'
      },
      {
        icon: Clock,
        label: 'Video Minutes',
        used: validation.current_usage.minutes_used,
        limit: validation.limits.max_minutes,
        remaining: validation.remaining.minutes,
        unit: 'minutes'
      },
      {
        icon: FileText,
        label: 'Documents',
        used: validation.current_usage.documents_generated,
        limit: validation.limits.max_documents === 999999 ? -1 : validation.limits.max_documents,
        remaining: validation.remaining.documents === 999999 ? -1 : validation.remaining.documents,
        unit: 'documents'
      },
      {
        icon: Zap,
        label: 'Tokens',
        used: validation.current_usage.tokens_consumed,
        limit: validation.limits.max_tokens === 999999 ? -1 : validation.limits.max_tokens,
        remaining: validation.remaining.tokens === 999999 ? -1 : validation.remaining.tokens,
        unit: 'tokens'
      }
    ];

    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        {usageItems.map((item) => {
          const Icon = item.icon;
          const isUnlimited = item.limit === -1;
          const usagePercentage = isUnlimited ? 0 : (item.used / item.limit) * 100;
          const isNearLimit = usagePercentage > 80;
          const isAtLimit = usagePercentage >= 100;

          return (
            <div key={item.label} className="bg-background-secondary p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${
                  isAtLimit ? 'text-error' : isNearLimit ? 'text-warning' : 'text-primary'
                }`} />
                <span className="text-sm font-medium text-text-primary">{item.label}</span>
              </div>
              
              <div className="text-xs text-text-secondary">
                {isUnlimited ? (
                  <span className="text-success font-medium">Unlimited</span>
                ) : (
                  <>
                    <span className={isAtLimit ? 'text-error' : ''}>{item.used}</span>
                    <span> / {item.limit} {item.unit}</span>
                    <div className="mt-1 w-full bg-neutral-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isAtLimit ? 'bg-error' : isNearLimit ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(100, usagePercentage)}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderValidationMessages = (validation: ValidationResponse) => {
    const hasErrors = validation.errors && validation.errors.length > 0;
    const hasWarnings = validation.warnings && validation.warnings.length > 0;

    if (!hasErrors && !hasWarnings) return null;

    return (
      <div className="space-y-2 mb-4">
        {hasErrors && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-error mb-1">Cannot proceed</p>
                <ul className="text-xs text-error space-y-1">
                  {validation.errors!.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {hasWarnings && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning mb-1">Heads up</p>
                <ul className="text-xs text-warning space-y-1">
                  {validation.warnings!.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUpgradePrompt = (validation: ValidationResponse) => {
    if (!validation.upgrade_required) return null;

    const suggestions = getUpgradeSuggestions(validation);

    return (
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <ArrowUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-primary mb-2">
              Upgrade to {suggestions.recommendedTier || 'a higher tier'}
            </h4>
            
            {suggestions.benefits.length > 0 && (
              <ul className="text-xs text-text-secondary space-y-1 mb-3">
                {suggestions.benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index}>• {benefit}</li>
                ))}
              </ul>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/pricing'}
                className="text-xs"
              >
                View Plans
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpgradeDetails(!showUpgradeDetails)}
                className="text-xs"
              >
                {showUpgradeDetails ? 'Hide' : 'Learn More'}
              </Button>
            </div>
            
            <AnimatePresence>
              {showUpgradeDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 pt-3 border-t border-primary/20"
                >
                  <ul className="text-xs text-text-secondary space-y-1">
                    {suggestions.benefits.slice(3).map((benefit, index) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-text-secondary">Checking subscription limits...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-error mb-4">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadUsageValidation}>
              Try Again
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validation) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">
            {actionType === 'conversation' ? 'Start Video Consultation' : 'Generate Document'}
          </h3>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="w-6 h-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Current subscription tier */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-text-primary">
              Current Plan: {validation.tier_info.current_tier.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>

        {showUsageSummary && renderUsageSummary(validation)}
        
        {renderValidationMessages(validation)}
        
        {renderUpgradePrompt(validation)}

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <Button
            variant={validation.allowed ? 'primary' : 'outline'}
            onClick={handleProceed}
            disabled={!validation.allowed}
          >
            {validation.allowed ? (
              actionType === 'conversation' ? 'Start Consultation' : 'Generate Document'
            ) : (
              'Upgrade Required'
            )}
          </Button>
        </div>

        {children}
      </CardContent>
    </Card>
  );
}