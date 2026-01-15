/**
 * Bank Connection API
 * Create Plaid Link Token for connecting bank accounts
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";

/**
 * POST /api/admin/bank/connect
 * Create a Plaid Link token to initiate bank connection
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    // Check if Plaid credentials are configured
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      return NextResponse.json(
        { 
          error: "Bank integration not configured",
          message: "Please add PLAID_CLIENT_ID and PLAID_SECRET to your environment variables"
        },
        { status: 503 }
      );
    }

    const PlaidClient = await import('plaid').then(m => m.PlaidApi);
    const { Configuration, PlaidEnvironments } = await import('plaid');

    const configuration = new Configuration({
      basePath: process.env.PLAID_ENV === 'production' 
        ? PlaidEnvironments.production 
        : PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    const plaidClient = new PlaidClient(configuration);

    // Create link token
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: 'admin-user',
      },
      client_name: 'SeeZee Finance Dashboard',
      products: ['transactions', 'auth', 'balance'],
      country_codes: ['US'],
      language: 'en',
      redirect_uri: process.env.PLAID_REDIRECT_URI,
    });

    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/bank/connect]", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to create bank connection",
        hint: "Make sure Plaid is properly configured in your .env file"
      },
      { status: 500 }
    );
  }
}
