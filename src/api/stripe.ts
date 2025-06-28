import { supabase } from '../lib/supabase';

/**
 * Create a Stripe checkout session
 * @param priceId The Stripe price ID
 * @param mode The checkout mode ('subscription' or 'payment')
 * @param trialDays Optional number of trial days for subscriptions
 * @returns The checkout session ID and URL
 */
export async function createCheckoutSession(
  priceId: string, 
  mode: 'subscription' | 'payment',
  trialDays?: number
) {
  try {
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      throw new Error('You must be logged in to make a purchase');
    }

    console.log(`Creating checkout session for price: ${priceId}, mode: ${mode}, trial days: ${trialDays}`);

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`,
      },
      body: JSON.stringify({
        price_id: priceId,
        mode,
        trial_period_days: trialDays,
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/pricing`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Checkout API error:', errorData);
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { sessionId, url } = await response.json();
    
    console.log(`Checkout session created: ${sessionId}, redirecting to: ${url}`);
    
    // Ensure we have a valid URL before redirecting
    if (!url) {
      console.error('No checkout URL returned from API');
      throw new Error('Failed to get checkout URL');
    }
    
    // Use window.location.href for a full page redirect to Stripe
    window.location.href = url;
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { sessionId, url } = await response.json();
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
  // This would typically be an API call, but for simplicity we're importing from the config
    const { products } = require('../stripe-config');
  return products.find((product: any) => product.priceId === priceId) || null;
}