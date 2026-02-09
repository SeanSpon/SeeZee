import Stripe from 'stripe';

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('Stripe client can only be used on the server');
}

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  }
  
  return stripeInstance;
}

// For backward compatibility
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    const stripeClient = getStripe();
    return (stripeClient as any)[prop];
  }
});

