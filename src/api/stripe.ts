import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

/**
 * Create a Stripe checkout session
 * @param priceId The Stripe price ID
 * @param mode The checkout mode ('subscription' or 'payment')
 * @param trialDays Optional number of trial days for subscriptions
 * @param autoRedirect If true, automatically redirects to Stripe
 * @returns The checkout session ID and URL
 */
export async function createCheckoutSession(
  priceId: string,
  mode: 'subscription' | 'payment',
  trialDays?: number,
  autoRedirect: boolean = true
): Promise<{ sessionId: string; url: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to make a purchase.');
    }

    const body: Record<string, unknown> = {
      price_id: priceId,
      mode,
      success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/pricing`,
    };

    if (mode === 'subscription' && trialDays) {
      body.subscription_data = {
        trial_settings: {
          trial_period_days: trialDays,
        },
      };
    }


    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to create checkout session');
    }

    const { sessionId, url } = responseData;
    console.log('Created Stripe session:', sessionId);

    if (autoRedirect) {
      if (!STRIPE_PUBLISHABLE_KEY) {
        console.warn('Stripe publishable key is not set. Falling back to direct redirect.');
        window.location.href = url;
      } else {
        const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        if (!stripe) throw new Error('Failed to load Stripe.js');
        await stripe.redirectToCheckout({ sessionId });
      }
    }

    return { sessionId, url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}


/**
 * Get the current user's subscription
 * @returns The subscription data or null if not found
 */
export async function getUserSubscription() {
  try {
    const { data, error } = await supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    throw error;
  }
}

/**
 * Get the current user's order history
 * @returns Array of order data
 */
export async function getUserOrders() {
  try {
    const { data, error } = await supabase
      .from('stripe_user_orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    throw error;
  }
}

/**
 * Get the product details for a price ID
 * @param priceId The Stripe price ID
 * @returns The product details or null if not found
 */
export function getProductByPriceId(priceId: string) {
  const { products } = require('../stripe-config');
  return products.find((product: any) => product.priceId === priceId) || null;
}
