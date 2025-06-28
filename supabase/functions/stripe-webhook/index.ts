import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const bodyText = await req.text();

    let event: Stripe.Event;

    try {
      const parsed = JSON.parse(bodyText);
      if (!parsed.id) throw new Error('Missing event ID in payload');
      event = await stripe.events.retrieve(parsed.id);
    } catch (err) {
      console.error('Failed to retrieve event from Stripe:', err);
      return new Response('Invalid webhook event', { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object;
  if (!stripeData || typeof stripeData !== 'object') return;

  const customerId = (stripeData as any).customer;
  if (!customerId || typeof customerId !== 'string') return;

  const isSubscription =
    event.type === 'checkout.session.completed' &&
    (stripeData as Stripe.Checkout.Session).mode === 'subscription';

  if (isSubscription) {
    console.log(`Syncing subscription for customer ${customerId}`);
    await syncCustomerFromStripe(customerId);
  }

  if (
    event.type === 'checkout.session.completed' &&
    (stripeData as Stripe.Checkout.Session).mode === 'payment'
  ) {
    const session = stripeData as Stripe.Checkout.Session;
    try {
      const { error } = await supabase.from('stripe_orders').insert({
        checkout_session_id: session.id,
        payment_intent_id: session.payment_intent,
        customer_id: customerId,
        amount_subtotal: session.amount_subtotal,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        status: 'completed',
      });

      if (error) throw error;

      console.info(`Logged one-time payment: ${session.id}`);
    } catch (err) {
      console.error('Failed to log order:', err);
    }
  }
}

async function syncCustomerFromStripe(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        { onConflict: 'customer_id' }
      );
      return;
    }

    const sub = subscriptions.data[0];

    const paymentMethod =
      typeof sub.default_payment_method !== 'string'
        ? sub.default_payment_method?.card
        : null;

    await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: sub.id,
        price_id: sub.items.data[0].price.id,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        payment_method_brand: paymentMethod?.brand ?? null,
        payment_method_last4: paymentMethod?.last4 ?? null,
        status: sub.status,
      },
      { onConflict: 'customer_id' }
    );
  } catch (err) {
    console.error('Error syncing subscription:', err);
    throw err;
  }
}
