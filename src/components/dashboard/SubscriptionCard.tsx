import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStripe } from '../../context/StripeContext';
import { Button } from '../ui/Button-bkp';
import { Card, CardContent } from '../ui/Card';
import { products } from '../../stripe-config';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function SubscriptionCard() {
  const { subscription, isLoading, error } = useStripe();

  // Find the product based on the price ID
  const product = subscription?.price_id 
    ? products.find(p => p.priceId === subscription.price_id) 
    : null;

  // Format date from Unix timestamp
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <LoadingSpinner size="sm" />
          <p className="mt-2 text-sm text-text-secondary">Loading subscription...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-primary mb-2">Subscription</h3>
          <p className="text-error text-sm mb-2">{error}</p>
          <Link to="/subscription">
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || subscription.subscription_status !== 'active') {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-primary mb-2">No Active Subscription</h3>
          <p className="text-text-secondary text-sm mb-3">
            Upgrade to access premium features and AI mentorship.
          </p>
          <Link to="/pricing">
            <Button variant="primary" size="sm">View Plans</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-primary">Your Subscription</h3>
            <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
              Active
            </span>
          </div>
          
          <div className="mb-3">
            <div className="text-xl font-bold text-primary">
              {product?.name || 'Subscription'}
            </div>
            <div className="text-sm text-text-secondary">
              Renews: {formatDate(subscription.current_period_end)}
            </div>
          </div>
          
          <Link to="/subscription">
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>Manage Subscription</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}