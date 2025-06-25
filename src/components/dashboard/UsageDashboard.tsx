import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Clock, 
  FileText, 
  Zap, 
  TrendingUp, 
  Calendar,
  ArrowUp,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button-bkp';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ValidationResponse, getUserUsageSummary } from '../../api/subscriptionValidator';
import { formatDistanceToNow } from 'date-fns';

interface UsageDashboardProps {
  userId: string;
  showUpgradePrompts?: boolean;
  compact?: boolean;
  className?: string;
}

export function UsageDashboard({
  userId,
  showUpgradePrompts = true,
  compact = false,
  className = ''
}: UsageDashboardProps) {
  const [usage, setUsage] = useState<ValidationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadUsageData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadUsageData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadUsageData = async () => {
    try {
      setError(null);
      const usageData = await getUserUsageSummary(userId);
      setUsage(usageData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading usage data:', err);
      setError('Failed to load usage data');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsageColor = (used: number, limit: number): string => {
    if (limit === -1) return 'text-success'; // Unlimited
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-error';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = (used: number, limit: number): string => {
    if (limit === -1) return 'bg-success'; // Unlimited
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-error';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-success';
  };

  const renderUsageMetric = (
    icon: React.ElementType,
    label: string,
    used: number,
    limit: number,
    unit: string,
    trend?: number
  ) => {
    const Icon = icon;
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
    const remaining = isUnlimited ? 'Unlimited' : Math.max(0, limit - used);

    return (
      <div className="bg-white p-4 rounded-lg border border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${getUsageColor(used, limit)}`} />
            <span className="font-medium text-text-primary">{label}</span>
          </div>
          
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${
              trend > 0 ? 'text-warning' : trend < 0 ? 'text-success' : 'text-neutral-500'
            }`}>
              <TrendingUp className={`w-3 h-3 ${trend >= 0 ? '' : 'rotate-180'}`} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${getUsageColor(used, limit)}`}>
              {used.toLocaleString()}
            </span>
            <span className="text-sm text-text-secondary">
              {isUnlimited ? 'Unlimited' : `of ${limit.toLocaleString()}`} {unit}
            </span>
          </div>
          
          {!isUnlimited && (
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(used, limit)}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>
              {isUnlimited ? 'No limits' : `${remaining} ${unit} remaining`}
            </span>
            {!isUnlimited && (
              <span>{percentage.toFixed(0)}% used</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUpgradePrompt = () => {
    if (!usage || !showUpgradePrompts || !usage.upgrade_required) return null;

    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ArrowUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-primary mb-1">Upgrade Recommended</h4>
              <p className="text-sm text-text-secondary mb-3">
                You've reached your usage limits. Upgrade to continue enjoying our services.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/pricing'}
              >
                View Plans
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCurrentPlan = () => {
    if (!usage) return null;

    const planName = usage.tier_info.current_tier
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return (
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-primary mb-1">{planName}</h3>
            <p className="text-sm text-text-secondary">Current subscription plan</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-success">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex gap-4 text-xs text-text-secondary">
          {usage.tier_info.allows_team_access && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>Team Access</span>
            </div>
          )}
          {usage.tier_info.allows_custom_personas && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>Custom Personas</span>
            </div>
          )}
          {usage.tier_info.allows_unlimited_tokens && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>Unlimited Tokens</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUsageAlerts = () => {
    if (!usage || (!usage.warnings && !usage.errors)) return null;

    const hasErrors = usage.errors && usage.errors.length > 0;
    const hasWarnings = usage.warnings && usage.warnings.length > 0;

    return (
      <div className="space-y-2">
        {hasErrors && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-error mb-1">Usage Limits Reached</p>
                <ul className="text-xs text-error space-y-1">
                  {usage.errors.map((error, index) => (
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
                <p className="text-sm font-medium text-warning mb-1">Usage Alerts</p>
                <ul className="text-xs text-warning space-y-1">
                  {usage.warnings.map((warning, index) => (
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

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-text-secondary">Loading usage data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center text-error mb-4">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadUsageData}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        {renderCurrentPlan()}
        {renderUsageAlerts()}
        
        <div className="grid grid-cols-2 gap-3">
          {renderUsageMetric(
            Video,
            'Sessions',
            usage.current_usage.sessions_used,
            usage.limits.max_sessions,
            'sessions'
          )}
          {renderUsageMetric(
            Clock,
            'Minutes',
            usage.current_usage.minutes_used,
            usage.limits.max_minutes,
            'minutes'
          )}
        </div>
        
        {renderUpgradePrompt()}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Usage Dashboard</h2>
          <p className="text-sm text-text-secondary">
            Track your subscription usage and limits
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Calendar className="w-3 h-3" />
          <span>Updated {formatDistanceToNow(lastRefresh)} ago</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadUsageData}
            className="w-6 h-6 p-0"
          >
            <BarChart3 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Current Plan */}
      {renderCurrentPlan()}

      {/* Usage Alerts */}
      {renderUsageAlerts()}

      {/* Usage Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderUsageMetric(
          Video,
          'Video Sessions',
          usage.current_usage.sessions_used,
          usage.limits.max_sessions,
          'sessions'
        )}
        
        {renderUsageMetric(
          Clock,
          'Video Minutes',
          usage.current_usage.minutes_used,
          usage.limits.max_minutes,
          'minutes'
        )}
        
        {renderUsageMetric(
          FileText,
          'Documents',
          usage.current_usage.documents_generated,
          usage.limits.max_documents,
          'documents'
        )}
        
        {renderUsageMetric(
          Zap,
          'Tokens',
          usage.current_usage.tokens_consumed,
          usage.limits.max_tokens,
          'tokens'
        )}
      </div>

      {/* Upgrade Prompt */}
      {renderUpgradePrompt()}

      {/* Additional Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/pricing'}
        >
          Compare Plans
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/consultation'}
          disabled={!usage.allowed}
        >
          Start Consultation
        </Button>
      </div>
    </div>
  );
}