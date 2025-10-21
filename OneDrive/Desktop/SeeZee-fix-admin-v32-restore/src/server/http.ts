import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

/**
 * Higher-order function to protect API routes with role-based access control
 * Checks session and user role before allowing handler execution
 */

export function withRole(
  allowedRoles: UserRole[],
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    try {
      const session = await auth();

      // Check if user is authenticated
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Unauthorized - Please sign in" },
          { status: 401 }
        );
      }

      // Check if user has required role
      const userRole = session.user.role as UserRole;
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { 
            error: "Forbidden - Insufficient permissions",
            required: allowedRoles,
            current: userRole 
          },
          { status: 403 }
        );
      }

      // User is authorized, proceed with handler
      return handler(req, context);
    } catch (error) {
      console.error("Role guard error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Shorthand wrapper for CEO-only routes
 */
export function withCEO(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withRole([UserRole.CEO], handler);
}

/**
 * Shorthand wrapper for Admin or CEO routes (read-only admin access)
 */
export function withAdminOrCEO(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withRole([UserRole.ADMIN, UserRole.CEO], handler);
}

/**
 * Shorthand wrapper for any internal staff (ADMIN, CEO, STAFF, etc.)
 */
export function withInternalStaff(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withRole(
    [
      UserRole.CEO,
      UserRole.ADMIN,
      UserRole.DESIGNER,
      UserRole.DEV,
      UserRole.OUTREACH,
      UserRole.INTERN,
      UserRole.STAFF,
    ],
    handler
  );
}

/**
 * Get current session (for use in handlers)
 */
export async function getSession() {
  return await auth();
}
