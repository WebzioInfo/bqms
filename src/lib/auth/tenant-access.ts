import { Role } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export type AuthenticatedUser = {
  id: string;
  role: Role;
  organizationId: string | null;
  name?: string | null;
  email?: string | null;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);
  const sessionUser = (session as any)?.user;

  console.log("[DEBUG AUTH] Current Session User:", sessionUser);

  if (!sessionUser?.id || !sessionUser?.role) {
    console.error("[DEBUG AUTH] Authentication failed: sessionUser is missing id or role", sessionUser);
    throw new AuthenticationError();
  }

  console.log("[DEBUG AUTH] Searching User By ID:", sessionUser.id);
  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, organizationId: true, role: true, name: true, email: true }
  });

  console.log("[DEBUG AUTH] Query Result Found:", !!dbUser, "dbUser:", dbUser);

  if (!dbUser) {
    console.error("[DEBUG AUTH] DB User NOT found for ID:", sessionUser.id);
    throw new AuthenticationError(`User not found in database. Searched ID: ${sessionUser.id}`);
  }

  return {
    id: sessionUser.id,
    role: dbUser.role as Role,
    organizationId: dbUser.organizationId ?? null,
    name: dbUser.name ?? null,
    email: dbUser.email ?? null,
  };
}

export async function requireAnyRole(allowedRoles: Role[]): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(`Role ${user.role} is not authorized for this action.`);
  }

  return user;
}

export async function requirePlatformAdmin(): Promise<AuthenticatedUser> {
  return requireAnyRole([Role.PLATFORM_ADMIN]);
}

export async function requireCompanyOperator(): Promise<AuthenticatedUser> {
  const user = await requireAnyRole([Role.COMPANY_ADMIN, Role.QC]);

  if (!user.organizationId) {
    throw new AuthorizationError("Company users must belong to an organization.");
  }

  return user;
}

export function scopedOrganizationWhere(user: AuthenticatedUser) {
  return user.role === Role.PLATFORM_ADMIN ? {} : { organizationId: user.organizationId as string };
}

export function scopedOptionalOrganizationWhere(user: AuthenticatedUser) {
  return user.role === Role.PLATFORM_ADMIN
    ? {}
    : { OR: [{ organizationId: user.organizationId }, { organizationId: null }] };
}

export function resolveWritableOrganizationId(user: AuthenticatedUser, requestedOrganizationId?: string | null) {
  if (user.role === Role.PLATFORM_ADMIN) {
    if (!requestedOrganizationId) {
      throw new AuthorizationError("An organization is required for this action.");
    }
    return requestedOrganizationId;
  }

  if (!user.organizationId) {
    throw new AuthorizationError("Company users must belong to an organization.");
  }

  if (requestedOrganizationId && requestedOrganizationId !== user.organizationId) {
    throw new AuthorizationError("You cannot write data for another organization.");
  }

  return user.organizationId;
}

export function assertCanReadOrganization(user: AuthenticatedUser, organizationId?: string | null) {
  if (user.role === Role.PLATFORM_ADMIN) return;

  if (!organizationId || user.organizationId !== organizationId) {
    throw new AuthorizationError("You cannot access data for another organization.");
  }
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server error";
}
