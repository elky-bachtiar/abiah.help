import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, CheckCircle, AlertCircle, Clock, Video } from 'lucide-react';
import { useStripe } from '../../context/StripeContext';
import { Button } from '../ui/Button-bkp';
import { Card, CardContent } from '../ui/Card';
import { products } from 'src/stripe-config';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function SubscriptionStatus() {
  const { subscription, isLoading, error, refreshSubscription } = useStripe();

  // Find the product based on the price ID
  const product = subscription?.price_id 
    ? products.find(p => p.priceId === subscription.price_id) 
    : null;

  // Format date from Unix timestamp
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Get status badge color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'trialing':
        return 'bg-warning/10 text-warning';
      case 'past_due':
      case 'unpaid':
      case 'canceled':
        return 'bg-error/10 text-error';
      default:
        return 'bg-neutral-200 text-text-secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-text-secondary">Loading subscription data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-error mb-4">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshSubscription}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">No Active Subscription</h3>
            <p className="text-text-secondary mb-4">
              You don't have an active subscription. Upgrade to access premium features.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/pricing'}>
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-primary">
                {product?.name || 'Subscription'}
              </h3>
              <div className="flex items-center mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(subscription.subscription_status)}`}>
                  {subscription.subscription_status === 'active' ? 'Active' :
                   subscription.subscription_status === 'trialing' ? 'Free Trial' : 
                   subscription.subscription_status || 'Unknown'}
                </span>
                {subscription.cancel_at_period_end && (
                  <span className="ml-2 px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full">
                    Cancels at period end
                  </span>
                )}
              </div>
            </div>
            
            {(subscription.subscription_status === 'active' || subscription.subscription_status === 'trialing') && (
              <div className="flex items-center text-success">
                <CheckCircle className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">
                  {subscription.subscription_status === 'trialing' ? 'Trial Active' : 'Active'}
                </span>
              </div>
            )}
          </div>
          
          {/* Subscription Features */}
          {product && (
            <div className="mb-4 p-4 bg-background-secondary rounded-lg">
              <h4 className="font-medium text-primary mb-2 flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Plan Features
              </h4>
              <div className="text-sm text-text-secondary">
                {product.name === 'Founder Essential' && (
                  <p>2 × 20-minute video sessions (40 minutes total)</p>
                )}
                {product.name === 'Founder Companion' && (
                  <p>3 × 25-minute video sessions (75 minutes total)</p>
                )}
                {product.name === 'Growth Partner' && (
                  <p>5 × 30-minute video sessions (150 minutes total)</p>
                )}
                {product.name === 'Expert Advisor' && (
                  <p>8 × 30-minute video sessions (240 minutes total)</p>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center text-text-secondary">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Current Period</span>
              </div>
              <span className="font-medium">
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </span>
            </div>
            
            {subscription.payment_method_brand && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-text-secondary">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>Payment Method</span>
                </div>
                <span className="font-medium capitalize">
                  {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center text-text-secondary">
                <Clock className="w-4 h-4 mr-2" />
                <span>Renews</span>
              </div>
              <span className="font-medium">
                {subscription.cancel_at_period_end 
                  ? 'Cancels on ' + formatDate(subscription.current_period_end)
                  : subscription.subscription_status === 'trialing'
                    ? 'Trial ends on ' + formatDate(subscription.current_period_end)
                    : 'Renews on ' + formatDate(subscription.current_period_end)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://billing.stripe.com/p/login/test_28o5nA0Ql9Hn8Sc144', '_blank')}
            >
              Manage Subscription
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/pricing'}
            >
              Change Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}