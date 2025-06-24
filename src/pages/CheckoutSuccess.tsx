import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home, Video, FileText, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button-bkp';
import { Card } from '../components/ui/Card';
import { getUserSubscription } from '../api/stripe';
import { products } from '../../stripe-config';

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        // Wait a moment to allow the webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const subscriptionData = await getUserSubscription();
        setSubscription(subscriptionData);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription details. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchSubscriptionData();
    } else {
      setIsLoading(false);
      setError('Invalid checkout session');
    }
  }, [sessionId]);

  // Find the product based on the price ID from the subscription
  const product = subscription?.price_id 
    ? products.find(p => p.priceId === subscription.price_id) 
    : null;

  return (
    <div className="min-h-screen bg-background-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="overflow-hidden">
          <div className="bg-primary p-6 text-white text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-white/80">
              Thank you for your purchase. Your subscription is now active.
            </p>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading your subscription details...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-error mb-4">{error}</p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="group"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-primary mb-4">Subscription Details</h2>
                  
                  <div className="bg-background-secondary p-4 rounded-lg mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-text-secondary">Plan:</span>
                      <span className="font-medium text-primary">{product?.name || 'Unknown Plan'}</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-text-secondary">Status:</span>
                      <span className={`font-medium ${
                        subscription?.subscription_status === 'active' ? 'text-success' : 
                        subscription?.subscription_status === 'trialing' ? 'text-success' : 'text-warning'
                      }`}>
                        {subscription?.subscription_status === 'active' ? 'Active' : 
                         subscription?.subscription_status === 'trialing' ? 'Free Trial' : 
                         subscription?.subscription_status || 'Processing'}
                      </span>
                    </div>
                    
                    {subscription?.current_period_end && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Current Period Ends:</span>
                        <span className="font-medium text-text-primary">
                          {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-success mb-6">
                    <p className="font-medium">
                      {subscription?.subscription_status === 'trialing' 
                        ? 'Your free trial is now active!' 
                        : 'Your subscription is now active!'}
                    </p>
                    <p className="text-sm mt-1">
                      {subscription?.subscription_status === 'trialing'
                        ? `You now have access to all features of the ${product?.name} plan for your trial period.`
                        : `You now have access to all features of the ${product?.name} plan.`}
                    </p>
                  </div>
                  
                  {/* Next steps */}
                  <h3 className="text-lg font-semibold text-primary mb-3">Next Steps</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <Video className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Start your first consultation</h4>
                        <p className="text-sm text-text-secondary">Connect with your AI mentor to discuss your startup goals.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Generate your first document</h4>
                        <p className="text-sm text-text-secondary">Create a pitch deck, business plan, or market analysis.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Schedule follow-up sessions</h4>
                        <p className="text-sm text-text-secondary">Plan your mentorship journey for maximum impact.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="primary"
                    className="w-full group"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/')}
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Return Home
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
        
        {/* Testimonial */}
        {!isLoading && !error && subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-center text-text-secondary text-sm"
          >
            <p className="italic">
              "Abiah helped me refine my pitch and secure $1.2M in seed funding. The AI mentorship was invaluable!"
            </p>
            <p className="font-medium mt-1">— Sarah K., FinTech Founder</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}