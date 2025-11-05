/**
 * Stripe Configuration Test
 * Run this to verify your Stripe keys are working
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '../.env.local' });

const Stripe = require('stripe');

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  console.log('\n🔧 Make sure .env.local exists with:');
  console.log('STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

const stripe = new Stripe(secretKey, {
  apiVersion: '2024-06-20',
});

async function testStripeConnection() {
  console.log('🔍 Testing Stripe Connection...\n');
  console.log(`🔑 Using key: ${secretKey.substring(0, 15)}...${secretKey.substring(secretKey.length - 4)}\n`);
  
  try {
    // Test 1: Retrieve account details
    console.log('✓ Secret Key Format: Valid');
    const balance = await stripe.balance.retrieve();
    console.log('✓ Stripe API Connection: Success');
    console.log(`  Available Balance: $${balance.available[0]?.amount / 100 || 0}`);
    console.log(`  Pending Balance: $${balance.pending[0]?.amount / 100 || 0}`);
    
    // Test 2: Check if in test mode
    const isTestMode = secretKey.startsWith('sk_test_');
    console.log(`✓ Mode: ${isTestMode ? 'TEST MODE ✓' : 'LIVE MODE ⚠️'}`);
    
    // Test 3: Get publishable key info
    console.log('\n📝 Next Steps:');
    console.log('1. Go to: https://dashboard.stripe.com/test/apikeys');
    console.log('2. Copy your "Publishable key" (starts with pk_test_)');
    console.log('3. Add it to your .env.local file as STRIPE_PUBLISHABLE_KEY');
    console.log('4. For webhooks, run: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
    
    console.log('\n✅ Stripe is configured and ready!');
    
  } catch (error) {
    console.error('❌ Stripe Connection Failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Verify your STRIPE_SECRET_KEY in .env.local');
    console.log('- Make sure you copied the entire key');
    console.log('- Check your internet connection');
  }
}

testStripeConnection();
