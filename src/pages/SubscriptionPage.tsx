import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus';
import { OrderHistory } from '../components/subscription/OrderHistory';
import { Button } from '../components/ui/Button-bkp';
import { Card, CardContent } from '../components/ui/Card';

export function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4 flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Subscription & Billing
            </h1>
            <p className="text-text-secondary text-lg">
              Manage your subscription, view billing history, and update payment methods
            </p>
          </motion.div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-4">
                <h3 className="font-semibold text-primary mb-4">Billing Menu</h3>
                <nav className="space-y-1">
                  <a 
                    href="#subscription"
                    className="flex items-center px-3 py-2 rounded-lg bg-primary/10 text-primary"
                  >
                    <CreditCard className="w-5 h-5 mr-3" />
                    <span>Subscription</span>
                  </a>
                  <a 
                    href="#orders"
                    className="flex items-center px-3 py-2 rounded-lg text-text-secondary hover:bg-neutral-100 hover:text-primary transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    <span>Order History</span>
                  </a>
                </nav>
              </div>
              
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-4">
                <h3 className="font-semibold text-primary mb-2">Need Help?</h3>
                <p className="text-text-secondary text-sm mb-3">
                  If you have any questions about your subscription or billing, our support team is here to help.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.location.href = 'mailto:support@abiah.help'}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <div id="subscription" className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Subscription Details
              </h2>
              <SubscriptionStatus />
              
              {/* Upgrade Options */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Upgrade Options</h3>
                  <p className="text-text-secondary mb-4">
                    Need more features or video sessions? Upgrade your plan anytime.
                  </p>
                  <Link to="/pricing">
                    <Button variant="primary" size="sm">
                      View Upgrade Options
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            
            <div id="orders">
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Order History
              </h2>
              <OrderHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}