import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_ROLES = ["CEO", "CFO", "ADMIN"];

/**
 * GET /api/integrations/stripe/metrics
 * Fetch Stripe business metrics including MRR, customers, subscriptions
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json({
        configured: false,
        error: "Stripe not configured",
        metrics: getPlaceholderMetrics(),
        quickLinks: getStripeQuickLinks(),
      });
    }

    try {
      // Fetch balance
      const balanceRes = await fetch("https://api.stripe.com/v1/balance", {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      });

      // Fetch recent charges (for revenue calculation)
      const chargesRes = await fetch(
        "https://api.stripe.com/v1/charges?limit=100",
        {
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
          },
        }
      );

      // Fetch subscriptions
      const subscriptionsRes = await fetch(
        "https://api.stripe.com/v1/subscriptions?status=active&limit=100",
        {
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
          },
        }
      );

      // Fetch customers
      const customersRes = await fetch(
        "https://api.stripe.com/v1/customers?limit=100",
        {
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
          },
        }
      );

      let balance = null;
      let charges: any[] = [];
      let subscriptions: any[] = [];
      let customers: any[] = [];

      if (balanceRes.ok) {
        balance = await balanceRes.json();
      }

      if (chargesRes.ok) {
        const data = await chargesRes.json();
        charges = data.data || [];
      }

      if (subscriptionsRes.ok) {
        const data = await subscriptionsRes.json();
        subscriptions = data.data || [];
      }

      if (customersRes.ok) {
        const data = await customersRes.json();
        customers = data.data || [];
      }

      // Calculate MRR from active subscriptions
      const mrr = subscriptions.reduce((total, sub) => {
        const monthlyAmount = sub.items?.data?.reduce((itemTotal: number, item: any) => {
          const price = item.price;
          if (price.recurring?.interval === "month") {
            return itemTotal + (price.unit_amount / 100);
          } else if (price.recurring?.interval === "year") {
            return itemTotal + (price.unit_amount / 100 / 12);
          }
          return itemTotal;
        }, 0) || 0;
        return total + monthlyAmount;
      }, 0);

      // Calculate this month's revenue
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyCharges = charges.filter(
        (c) => new Date(c.created * 1000) >= startOfMonth && c.status === "succeeded"
      );
      const monthlyRevenue = monthlyCharges.reduce(
        (total, c) => total + c.amount / 100,
        0
      );

      // Get available balance
      const availableBalance = balance?.available?.reduce(
        (total: number, b: any) => total + b.amount / 100,
        0
      ) || 0;

      const pendingBalance = balance?.pending?.reduce(
        (total: number, b: any) => total + b.amount / 100,
        0
      ) || 0;

      return NextResponse.json({
        configured: true,
        metrics: {
          mrr: formatCurrency(mrr),
          mrrValue: mrr,
          monthlyRevenue: formatCurrency(monthlyRevenue),
          monthlyRevenueValue: monthlyRevenue,
          availableBalance: formatCurrency(availableBalance),
          availableBalanceValue: availableBalance,
          pendingBalance: formatCurrency(pendingBalance),
          pendingBalanceValue: pendingBalance,
          activeSubscriptions: subscriptions.length,
          totalCustomers: customers.length,
          recentCharges: charges.slice(0, 5).map((c) => ({
            id: c.id,
            amount: formatCurrency(c.amount / 100),
            status: c.status,
            customer: c.customer,
            description: c.description,
            created: new Date(c.created * 1000).toISOString(),
          })),
        },
        quickLinks: getStripeQuickLinks(),
      });
    } catch (apiError) {
      console.error("Stripe API error:", apiError);
      return NextResponse.json({
        configured: true,
        error: "Failed to fetch Stripe data",
        metrics: getPlaceholderMetrics(),
        quickLinks: getStripeQuickLinks(),
      });
    }
  } catch (error) {
    console.error("[GET /api/integrations/stripe/metrics]", error);
    return NextResponse.json(
      { error: "Failed to fetch Stripe metrics" },
      { status: 500 }
    );
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPlaceholderMetrics() {
  return {
    mrr: "$0",
    mrrValue: 0,
    monthlyRevenue: "$0",
    monthlyRevenueValue: 0,
    availableBalance: "$0",
    availableBalanceValue: 0,
    pendingBalance: "$0",
    pendingBalanceValue: 0,
    activeSubscriptions: 0,
    totalCustomers: 0,
    recentCharges: [],
  };
}

function getStripeQuickLinks() {
  return [
    {
      name: "Dashboard",
      url: "https://dashboard.stripe.com",
      description: "Main Stripe dashboard",
    },
    {
      name: "Payments",
      url: "https://dashboard.stripe.com/payments",
      description: "View all payments",
    },
    {
      name: "Customers",
      url: "https://dashboard.stripe.com/customers",
      description: "Manage customers",
    },
    {
      name: "Subscriptions",
      url: "https://dashboard.stripe.com/subscriptions",
      description: "Active subscriptions",
    },
    {
      name: "Invoices",
      url: "https://dashboard.stripe.com/invoices",
      description: "All invoices",
    },
    {
      name: "Products",
      url: "https://dashboard.stripe.com/products",
      description: "Products and pricing",
    },
    {
      name: "Payouts",
      url: "https://dashboard.stripe.com/balance/overview",
      description: "Balance and payouts",
    },
    {
      name: "Reports",
      url: "https://dashboard.stripe.com/reports",
      description: "Financial reports",
    },
  ];
}
