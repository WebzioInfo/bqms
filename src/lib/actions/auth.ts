"use server";
import prisma from "@/lib/prisma";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";



import { sendPasswordResetEmail, sendSecurityNotification, sendWelcomeEmail } from "@/lib/email";
export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required." };

  const user = await prisma.user.findUnique({ where: { email } });
  
  // Security: Do not reveal if email exists, just return success
  if (!user) return { success: "If that email exists, a reset link has been sent." };

  // Generate secure token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { resetTokenHash, resetTokenExpires }
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  await sendPasswordResetEmail(user.email, user.name || "User", resetUrl);

  return { success: "If that email exists, a reset link has been sent." };
}

export async function resetPassword(formData: FormData, resetToken: string) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  // Basic policy check (should be matched with frontend)
  const policyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!policyRegex.test(password)) {
    return { error: "Password does not meet the minimum security requirements." };
  }

  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash,
      resetTokenExpires: { gt: new Date() }
    }
  });

  if (!user) {
    return { error: "Invalid or expired reset token." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpires: null,
      failedLoginAttempts: 0,
      lockedUntil: null
    }
  });

  await sendSecurityNotification(user.email, user.name || "User", "Your password has been successfully reset.");

  return { success: "Password successfully reset! You can now log in." };
}

export async function changePassword(formData: FormData, userId: string) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found." };

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isPasswordValid) return { error: "Incorrect current password." };

  const policyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!policyRegex.test(newPassword)) {
    return { error: "New password does not meet the minimum security requirements." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  return { success: "Password changed successfully." };
}
