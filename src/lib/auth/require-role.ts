import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { Role } from "@prisma/client";

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Validates the session and ensures the user has one of the allowed roles.
 * Optionally validates that the user belongs to the specified organization.
 * 
 * @param allowedRoles Array of allowed roles
 * @param organizationId Optional organization ID to enforce row-level access
 * @returns The authenticated session if validation passes
 */
export async function requireRole(allowedRoles: Role[], organizationId?: string) {
  const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
  const session = await getServerSession(authOptions);

  if (!session || !(session as any).user) {
    throw new AuthenticationError();
  }

  let userRole = ((session as any).user as any).role as Role;
  
  // Fallback: If role is undefined in session (e.g. old JWT token), fetch from DB
  if (!userRole) {
    const dbUser = await prisma.user.findUnique({
      where: { id: (session as any).user.id },
      select: { role: true, organizationId: true }
    });
    if (!dbUser) throw new AuthenticationError("User not found in database.");
    userRole = dbUser.role;
    // Update session object for current request
    ((session as any).user as any).role = dbUser.role;
    ((session as any).user as any).organizationId = dbUser.organizationId;
  }
  
  if (!allowedRoles.includes(userRole)) {
    throw new AuthorizationError(`Role ${userRole} is not authorized for this action.`);
  }

  // Row-level authorization check
  // PLATFORM_ADMIN bypasses all organization checks.
  if (organizationId && userRole !== "PLATFORM_ADMIN") {
    // Assuming session object contains organizationId, we need to fetch it or ensure it's in JWT.
    // For now, if we don't have it in session, we would need to query the user, or we can assume we 
    // fetch the user to be safe and secure.
    
    const { PrismaClient } = await import("@prisma/client");
    
    const user = await prisma.user.findUnique({
      where: { id: (session as any).user.id }
    });

    if (!user || user.organizationId !== organizationId) {
      throw new AuthorizationError("You do not have permission to modify data for this organization.");
    }
  }

  return session;
}
