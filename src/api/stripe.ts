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

    // Construct body conditionally
    const body: Record<string, any> = {
      price_id: priceId,
      mode,
      success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/pricing`,
    };

    if (mode === 'subscription' && trialDays) {
      body.trial_period_days = trialDays;
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Checkout API error:', responseData);
      throw new Error(responseData.error || 'Failed to create checkout session');
    }

    const { sessionId, url } = responseData;

    console.log(`Checkout session created: ${sessionId}, redirecting to: ${url}`);

    if (!url) {
      console.error('No checkout URL returned from API');
      throw new Error('Failed to get checkout URL');
    }

    window.location.href = url;

    return { sessionId, url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
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