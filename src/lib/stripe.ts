import Stripe from 'stripe';

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('Stripe client can only be used on the server');
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

