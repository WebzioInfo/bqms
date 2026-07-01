import { Role } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
  const user = (session as any)?.user;

  if (!user?.id || !user?.role) {
    throw new AuthenticationError();
  }

  return {
    id: user.id,
    role: user.role as Role,
    organizationId: user.organizationId ?? null,
    name: user.name ?? null,
    email: user.email ?? null,
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
