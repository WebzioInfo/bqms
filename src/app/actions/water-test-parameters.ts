"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ParameterType } from "@prisma/client";

export async function getWaterTestParameters(organizationId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  return prisma.waterTestParameter.findMany({
    where: { organizationId },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
}

export async function createWaterTestParameter(data: {
  organizationId: string;
  name: string;
  type: ParameterType;
  unit: string;
  acceptableMin?: number;
  acceptableMax?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  // @ts-ignore
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "BIOFIX_ADMIN" && session.user.role !== "QC_USER") {
    throw new Error("Unauthorized");
  }

  return prisma.waterTestParameter.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      type: data.type,
      unit: data.unit,
      acceptableMin: data.acceptableMin,
      acceptableMax: data.acceptableMax,
    }
  });
}

export async function toggleWaterTestParameter(id: string, isActive: boolean) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.waterTestParameter.update({
    where: { id },
    data: { isActive },
  });
}
