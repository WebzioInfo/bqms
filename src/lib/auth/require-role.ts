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
  // @ts-ignore - Assuming standard next-auth setup with GET handler exported
  const { GET: authOptions } = await import("@/app/api/auth/[...nextauth]/route");
  const session = await getServerSession(authOptions);

  if (!session || !(session as any).user) {
    throw new AuthenticationError();
  }

  const userRole = ((session as any).user as any).role as Role;
  
  if (!allowedRoles.includes(userRole)) {
    throw new AuthorizationError(`Role ${userRole} is not authorized for this action.`);
  }

  // Row-level authorization check
  // Note: if a user is SUPER_ADMIN, they might bypass org checks depending on business logic.
  // We'll enforce that if organizationId is passed, the user must belong to it or be a SUPER_ADMIN.
  if (organizationId && userRole !== "SUPER_ADMIN") {
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
