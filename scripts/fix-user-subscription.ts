/**
 * Fix User Subscription Script
 * 
 * Purpose: Fix a user's subscription that was created before webhook fixes were deployed.
 * This script manually links a Stripe subscription to a user's MaintenancePlan.
 * 
 * Context: 
 * - User subscribed to Quarterly Plan ($2,000/quarter = ~$667/month)
 * - Webhook didn't properly link subscription to MaintenancePlan
 * - Dashboard shows incorrect tier and 0 hours
 * 
 * Usage: npm run fix-subscription
 */

// Load environment variables from .env.local and .env
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient, MaintenancePlanStatus, MaintenanceStatus } from '@prisma/client';
import Stripe from 'stripe';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const prisma = new PrismaClient();

// User details
const USER_EMAIL = 'ethan.cambron@stu.spencer.kyschools.us';

// Expected subscription details for Quarterly Plan (PROFESSIONAL tier)
const EXPECTED_TIER = 'PROFESSIONAL';
const EXPECTED_HOURS_PER_MONTH = 10; // 30 hours per quarter = 10/month
const EXPECTED_CHANGE_REQUESTS = -1; // Unlimited
const EXPECTED_MONTHLY_PRICE = 200000; // $2,000 in cents (for quarterly billing)

async function main() {
  console.log('🔧 Starting subscription fix script...\n');
  console.log(`Target user: ${USER_EMAIL}\n`);
  
  try {
    // Step 1: Find the user
    console.log('📧 Step 1: Finding user by email...');
    const user = await prisma.user.findUnique({
      where: { email: USER_EMAIL },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });
    
    if (!user) {
      throw new Error(`❌ User not found with email: ${USER_EMAIL}`);
    }
    
    console.log(`✅ Found user: ${user.name || user.email} (ID: ${user.id})`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Organizations: ${user.organizations.length}\n`);
    
    // Step 2: Find organization and project
    console.log('🏢 Step 2: Finding organization and project...');
    
    if (user.organizations.length === 0) {
      throw new Error('❌ User has no organizations');
    }
    
    const organization = user.organizations[0].organization;
    console.log(`✅ Found organization: ${organization.name} (ID: ${organization.id})`);
    
    // Find project for this organization
    const projects = await prisma.project.findMany({
      where: { organizationId: organization.id },
      include: {
        maintenancePlanRel: true,
      },
    });
    
    if (projects.length === 0) {
      throw new Error('❌ No projects found for this organization');
    }
    
    const project = projects[0];
    console.log(`✅ Found project: ${project.name} (ID: ${project.id})`);
    console.log(`   - Current Stripe Subscription ID: ${project.stripeSubscriptionId || 'NONE'}`);
    console.log(`   - Maintenance Status: ${project.maintenanceStatus || 'NONE'}\n`);
    
    // Step 3: Find active Stripe subscription for this customer
    console.log('💳 Step 3: Finding active Stripe subscription...');
    
    if (!organization.stripeCustomerId) {
      throw new Error('❌ Organization has no Stripe customer ID');
    }
    
    console.log(`   Searching for subscriptions for customer: ${organization.stripeCustomerId}`);
    
    const subscriptions = await stripe.subscriptions.list({
      customer: organization.stripeCustomerId,
      status: 'active',
      limit: 10,
    });
    
    if (subscriptions.data.length === 0) {
      throw new Error('❌ No active subscriptions found in Stripe');
    }
    
    console.log(`✅ Found ${subscriptions.data.length} active subscription(s)\n`);
    
    // Display all subscriptions and let's pick the right one
    subscriptions.data.forEach((sub, index) => {
      const priceAmount = sub.items.data[0]?.price?.unit_amount || 0;
      const interval = sub.items.data[0]?.price?.recurring?.interval || 'unknown';
      console.log(`   [${index}] Subscription ID: ${sub.id}`);
      console.log(`       - Amount: $${(priceAmount / 100).toFixed(2)} per ${interval}`);
      console.log(`       - Status: ${sub.status}`);
      console.log(`       - Period: ${new Date(sub.current_period_start * 1000).toLocaleDateString()} to ${new Date(sub.current_period_end * 1000).toLocaleDateString()}`);
      console.log(`       - Metadata: ${JSON.stringify(sub.metadata)}`);
    });
    
    // For this fix, we'll use the first active subscription
    // In production, you might want to verify which one is correct
    const subscription = subscriptions.data[0];
    console.log(`\n✅ Using subscription: ${subscription.id}\n`);
    
    // Step 4: Find or ensure MaintenancePlan exists
    console.log('📋 Step 4: Finding or creating MaintenancePlan...');
    
    let maintenancePlan = project.maintenancePlanRel;
    
    if (!maintenancePlan) {
      console.log('   Creating new MaintenancePlan...');
      maintenancePlan = await prisma.maintenancePlan.create({
        data: {
          projectId: project.id,
          tier: EXPECTED_TIER,
          monthlyPrice: EXPECTED_MONTHLY_PRICE,
          supportHoursIncluded: EXPECTED_HOURS_PER_MONTH,
          changeRequestsIncluded: EXPECTED_CHANGE_REQUESTS,
          status: MaintenancePlanStatus.PAUSED,
        },
      });
      console.log(`✅ Created MaintenancePlan (ID: ${maintenancePlan.id})`);
    } else {
      console.log(`✅ Found existing MaintenancePlan (ID: ${maintenancePlan.id})`);
      console.log(`   - Current Tier: ${maintenancePlan.tier}`);
      console.log(`   - Current Hours: ${maintenancePlan.supportHoursIncluded}`);
      console.log(`   - Hours Used: ${maintenancePlan.supportHoursUsed}`);
      console.log(`   - Status: ${maintenancePlan.status}`);
      console.log(`   - Stripe Subscription ID: ${maintenancePlan.stripeSubscriptionId || 'NONE'}`);
    }
    
    console.log('\n');
    
    // Step 5: Update MaintenancePlan with correct subscription details
    console.log('🔄 Step 5: Updating MaintenancePlan with Stripe subscription...');
    
    const periodStart = new Date(subscription.current_period_start * 1000);
    const periodEnd = new Date(subscription.current_period_end * 1000);
    
    console.log(`   Setting billing period:`);
    console.log(`   - Start: ${periodStart.toISOString()}`);
    console.log(`   - End: ${periodEnd.toISOString()}`);
    
    const updatedPlan = await prisma.maintenancePlan.update({
      where: { id: maintenancePlan.id },
      data: {
        stripeSubscriptionId: subscription.id,
        tier: EXPECTED_TIER,
        supportHoursIncluded: EXPECTED_HOURS_PER_MONTH,
        supportHoursUsed: 0, // Reset usage
        changeRequestsIncluded: EXPECTED_CHANGE_REQUESTS,
        changeRequestsUsed: 0, // Reset usage
        urgentRequestsUsed: 0, // Reset urgent requests
        requestsToday: 0, // Reset daily counter
        status: MaintenancePlanStatus.ACTIVE,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        monthlyPrice: EXPECTED_MONTHLY_PRICE,
      },
    });
    
    console.log(`✅ MaintenancePlan updated successfully!`);
    console.log(`   - Tier: ${updatedPlan.tier}`);
    console.log(`   - Support Hours: ${updatedPlan.supportHoursIncluded} hours/month`);
    console.log(`   - Change Requests: ${updatedPlan.changeRequestsIncluded === -1 ? 'Unlimited' : updatedPlan.changeRequestsIncluded}`);
    console.log(`   - Status: ${updatedPlan.status}`);
    console.log(`   - Monthly Price: $${(Number(updatedPlan.monthlyPrice) / 100).toFixed(2)}`);
    console.log(`   - Stripe Subscription: ${updatedPlan.stripeSubscriptionId}\n`);
    
    // Step 6: Update Project for backward compatibility
    console.log('🗂️  Step 6: Updating Project with subscription details...');
    
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: {
        stripeSubscriptionId: subscription.id,
        maintenanceStatus: MaintenanceStatus.ACTIVE,
        nextBillingDate: periodEnd,
      },
    });
    
    console.log(`✅ Project updated successfully!`);
    console.log(`   - Maintenance Status: ${updatedProject.maintenanceStatus}`);
    console.log(`   - Next Billing Date: ${updatedProject.nextBillingDate?.toLocaleDateString()}`);
    console.log(`   - Stripe Subscription: ${updatedProject.stripeSubscriptionId}\n`);
    
    // Step 7: Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ SUBSCRIPTION FIX COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 Summary:');
    console.log(`   User: ${user.name || user.email}`);
    console.log(`   Organization: ${organization.name}`);
    console.log(`   Project: ${project.name}`);
    console.log(`   Tier: ${EXPECTED_TIER}`);
    console.log(`   Hours Available: ${EXPECTED_HOURS_PER_MONTH} per month (30 per quarter)`);
    console.log(`   Change Requests: Unlimited`);
    console.log(`   Status: ACTIVE`);
    console.log(`   Stripe Subscription: ${subscription.id}`);
    console.log(`   Billing Period: ${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`);
    console.log('\n');
    console.log('💡 The user should now see the correct tier and hours in their dashboard.');
    console.log('   Please refresh the page to see the updated information.');
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
