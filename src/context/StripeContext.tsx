import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { getUserSubscription, getUserOrders } from '../api/stripe';

interface StripeContextType {
  subscription: any | null;
  orders: any[];
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [user] = useAtom(userAtom);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserSubscription();
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrdersData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  // Load subscription and orders when user changes
  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
      fetchOrdersData();
    } else {
      setSubscription(null);
      setOrders([]);
    }
  }, [user]);

  const value = {
    subscription,
    orders,
    isLoading,
    error,
    refreshSubscription: fetchSubscriptionData,
    refreshOrders: fetchOrdersData
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
}

export function useStripe() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
}