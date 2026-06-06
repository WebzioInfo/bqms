"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import bcrypt from "bcryptjs";

export async function createUser(data: any) {
  try {
    await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN"]);
    
    // Hash password if provided, else dummy password
    const hashedPassword = await bcrypt.hash(data.password || "password123", 10);
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: hashedPassword,
        role: data.role,
        organizationId: data.organizationId || null,
      }
    });
    
    revalidatePath("/users");
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    await requireRole(["SUPER_ADMIN", "BIOFIX_ADMIN"]);
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        organizationId: data.organizationId || null,
      }
    });
    
    revalidatePath("/users");
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id: string) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    await prisma.user.delete({ where: { id } });
    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
