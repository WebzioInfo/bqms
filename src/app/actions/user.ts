"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import {
  errorMessage,
  requireAnyRole,
  resolveWritableOrganizationId,
  scopedOrganizationWhere,
} from "@/lib/auth/tenant-access";

const LIST_PAGE_SIZE = 100;

export async function getUsers() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const users = await prisma.user.findMany({
      where: scopedOrganizationWhere(user),
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: { id: true, name: true }
        },
      },
      orderBy: { createdAt: 'desc' },
      take: LIST_PAGE_SIZE,
    });
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getUserById(id: string) {
  try {
    const currentUser = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const user = await prisma.user.findFirst({
      where: { id, ...scopedOrganizationWhere(currentUser) },
      include: { organization: true }
    });
    if (!user) return { success: false, error: "Not found" };
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createUser(data: any) {
  try {
    const currentUser = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const requestedRole = data.role as Role;
    if (!Object.values(Role).includes(requestedRole)) {
      return { success: false, error: "Invalid role." };
    }
    if (currentUser.role !== Role.PLATFORM_ADMIN && requestedRole === Role.PLATFORM_ADMIN) {
      return { success: false, error: "Company admins cannot create platform admins." };
    }
    const organizationId = requestedRole === Role.PLATFORM_ADMIN
      ? null
      : resolveWritableOrganizationId(currentUser, data.organizationId);

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) return { success: false, error: "Email already in use." };

    const passwordHash = await bcrypt.hash(data.password || "Password@123", 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: requestedRole,
        organizationId,
        isActive: data.isActive ?? true,
      }
    });
    revalidatePath("/users");
    return { success: true, data: newUser };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const currentUser = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const requestedRole = data.role as Role;
    if (!Object.values(Role).includes(requestedRole)) {
      return { success: false, error: "Invalid role." };
    }
    if (currentUser.role !== Role.PLATFORM_ADMIN && requestedRole === Role.PLATFORM_ADMIN) {
      return { success: false, error: "Company admins cannot manage platform admins." };
    }
    const organizationId = requestedRole === Role.PLATFORM_ADMIN
      ? null
      : resolveWritableOrganizationId(currentUser, data.organizationId);

    const updateData: any = {
      name: data.name,
      email: data.email,
      role: requestedRole,
      organizationId,
      isActive: data.isActive,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.updateMany({
      where: { id, ...scopedOrganizationWhere(currentUser) },
      data: updateData
    });
    if (updatedUser.count === 0) return { success: false, error: "Not found" };
    const reloadedUser = await prisma.user.findFirst({ where: { id, ...scopedOrganizationWhere(currentUser) } });
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { success: true, data: reloadedUser };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteUser(id: string) {
  try {
    const currentUser = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const deleted = await prisma.user.deleteMany({
      where: { id, ...scopedOrganizationWhere(currentUser) }
    });
    if (deleted.count === 0) return { success: false, error: "Not found" };
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
