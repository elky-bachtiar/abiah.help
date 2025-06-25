import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Clock, 
  Video, 
  FileText, 
  Zap,
  ArrowUp,
  X,
  CheckCircle 
} from 'lucide-react';
import { Button } from '../ui/Button-bkp';
import { Card, CardContent } from '../ui/Card';
import { ValidationResponse, getUpgradeSuggestions } from '../../api/subscriptionValidator';

interface LimitWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed?: () => void;
  onUpgrade: () => void;
  validation: ValidationResponse;
  actionType: 'conversation' | 'document_generation';
  estimatedUsage?: {
    minutes?: number;
    tokens?: number;
  };
}

export function LimitWarningModal({
  isOpen,
  onClose,
  onProceed,
  onUpgrade,
  validation,
  actionType,
  estimatedUsage
}: LimitWarningModalProps) {
  if (!isOpen) return null;

  const hasErrors = validation.errors && validation.errors.length > 0;
  const hasWarnings = validation.warnings && validation.warnings.length > 0;
  const suggestions = getUpgradeSuggestions(validation);

  const getActionTitle = () => {
    return actionType === 'conversation' 
      ? 'Start Video Consultation' 
      : 'Generate Document';
  };

  const getUsageImpact = () => {
    if (actionType === 'conversation') {
      const estimatedMinutes = estimatedUsage?.minutes || 30;
      const remainingMinutes = validation.remaining.minutes;
      const remainingSessions = validation.remaining.sessions;
      
      return {
        willExceed: remainingMinutes < estimatedMinutes || remainingSessions <= 0,
        details: [
          `This consultation will use approximately ${estimatedMinutes} minutes`,
          `You have ${remainingSessions} sessions and ${remainingMinutes} minutes remaining`,
          remainingMinutes < estimatedMinutes 
            ? `This may exceed your limit by ${estimatedMinutes - remainingMinutes} minutes`
            : 'This consultation will fit within your current limits'
        ]
      };
    } else {
      const estimatedTokens = estimatedUsage?.tokens || 2000;
      const remainingTokens = validation.remaining.tokens;
      const remainingDocs = validation.remaining.documents;
      
      return {
        willExceed: remainingTokens < estimatedTokens || remainingDocs <= 0,
        details: [
          `This document will use approximately ${estimatedTokens.toLocaleString()} tokens`,
          `You have ${remainingDocs} documents and ${remainingTokens.toLocaleString()} tokens remaining`,
          remainingTokens < estimatedTokens 
            ? `This may exceed your limit by ${(estimatedTokens - remainingTokens).toLocaleString()} tokens`
            : 'This document generation will fit within your current limits'
        ]
      };
    }
  };

  const usageImpact = getUsageImpact();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md"
        >
          <Card className="shadow-xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {hasErrors ? (
                    <AlertTriangle className="w-6 h-6 text-error" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  )}
                  <h3 className="text-lg font-semibold text-text-primary">
                    {hasErrors ? 'Usage Limit Reached' : 'Usage Warning'}
                  </h3>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-6 h-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Action being attempted */}
              <div className="mb-4 p-3 bg-background-secondary rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {actionType === 'conversation' ? (
                    <Video className="w-4 h-4 text-primary" />
                  ) : (
                    <FileText className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm font-medium text-text-primary">
                    {getActionTitle()}
                  </span>
                </div>
                
                <ul className="text-xs text-text-secondary space-y-1">
                  {usageImpact.details.map((detail, index) => (
                    <li key={index}>• {detail}</li>
                  ))}
                </ul>
              </div>

              {/* Current usage summary */}
              <div className="mb-4 space-y-2">
                <h4 className="text-sm font-medium text-text-primary">Current Usage</h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-background-secondary rounded">
                    <div className="flex items-center gap-1">
                      <Video className="w-3 h-3 text-primary" />
                      <span>Sessions</span>
                    </div>
                    <span className="font-medium">
                      {validation.current_usage.sessions_used}/{validation.limits.max_sessions}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-background-secondary rounded">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      <span>Minutes</span>
                    </div>
                    <span className="font-medium">
                      {validation.current_usage.minutes_used}/{validation.limits.max_minutes}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-background-secondary rounded">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-primary" />
                      <span>Documents</span>
                    </div>
                    <span className="font-medium">
                      {validation.current_usage.documents_generated}/
                      {validation.limits.max_documents === 999999 ? '∞' : validation.limits.max_documents}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-background-secondary rounded">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" />
                      <span>Tokens</span>
                    </div>
                    <span className="font-medium">
                      {validation.current_usage.tokens_consumed.toLocaleString()}/
                      {validation.limits.max_tokens === 999999 ? '∞' : validation.limits.max_tokens.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error/Warning Messages */}
              {(hasErrors || hasWarnings) && (
                <div className="mb-4 space-y-2">
                  {hasErrors && (
                    <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                      <ul className="text-xs text-error space-y-1">
                        {validation.errors!.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {hasWarnings && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                      <ul className="text-xs text-warning space-y-1">
                        {validation.warnings!.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Upgrade recommendation */}
              {suggestions.shouldUpgrade && (
                <div className="mb-4 bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <ArrowUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-sm font-medium text-primary mb-1">
                        Upgrade to {suggestions.recommendedTier}
                      </h5>
                      <ul className="text-xs text-text-secondary space-y-1">
                        {suggestions.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                
                {!hasErrors && onProceed && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onProceed();
                      onClose();
                    }}
                    className="flex-1"
                  >
                    Proceed Anyway
                  </Button>
                )}
                
                <Button
                  variant="primary"
                  onClick={onUpgrade}
                  className="flex-1"
                >
                  {hasErrors ? 'Upgrade Now' : 'Upgrade'}
                </Button>
              </div>

              {/* Additional help text */}
              <div className="mt-4 text-xs text-text-secondary text-center">
                {hasErrors ? (
                  'You must upgrade to continue using this feature.'
                ) : (
                  'You can proceed with current limits or upgrade for more capacity.'
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Hook for managing limit warning modals
export function useLimitWarningModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [validation, setValidation] = React.useState<ValidationResponse | null>(null);
  const [actionType, setActionType] = React.useState<'conversation' | 'document_generation'>('conversation');
  const [estimatedUsage, setEstimatedUsage] = React.useState<{minutes?: number; tokens?: number}>({});

  const showWarning = (
    validationResult: ValidationResponse, 
    action: 'conversation' | 'document_generation',
    usage?: {minutes?: number; tokens?: number}
  ) => {
    setValidation(validationResult);
    setActionType(action);
    setEstimatedUsage(usage || {});
    setIsOpen(true);
  };

  const hideWarning = () => {
    setIsOpen(false);
    setValidation(null);
  };

  return {
    isOpen,
    validation,
    actionType,
    estimatedUsage,
    showWarning,
    hideWarning
  };
}