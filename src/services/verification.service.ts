import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export class VerificationService {
  /**
   * Tracks a verification scan while maintaining user privacy by hashing the IP address.
   */
  static async trackScan(data: {
    qrCodeId: string;
    rawIp?: string;
    userAgent?: string;
    location?: string;
  }) {
    let hashedIp = null;
    
    // Anonymize IP to comply with privacy requirements
    if (data.rawIp) {
      hashedIp = crypto.createHash("sha256").update(data.rawIp).digest("hex");
    }

    try {
      const scan = await prisma.verificationScan.create({
        data: {
          qrCodeId: data.qrCodeId,
          ipAddress: hashedIp,
          userAgent: data.userAgent,
          location: data.location,
        },
      });

      return { success: true, scan };
    } catch (error: any) {
      // We don't want tracking failures to break the user verification experience
      console.error("Failed to track verification scan:", error);
      return { success: false, error: error.message };
    }
  }
}
