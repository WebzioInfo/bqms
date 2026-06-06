-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "pdfFileId" TEXT;

-- AlterTable
ALTER TABLE "Inspection" ADD COLUMN     "reportFileId" TEXT;

-- AlterTable
ALTER TABLE "LaboratoryReport" ADD COLUMN     "reportFileId" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "logoId" TEXT;

-- AlterTable
ALTER TABLE "QRCode" ADD COLUMN     "imageFileId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarId" TEXT;

-- CreateTable
CREATE TABLE "CloudFile" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CloudFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CloudFile_publicId_key" ON "CloudFile"("publicId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "CloudFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "CloudFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryReport" ADD CONSTRAINT "LaboratoryReport_reportFileId_fkey" FOREIGN KEY ("reportFileId") REFERENCES "CloudFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_reportFileId_fkey" FOREIGN KEY ("reportFileId") REFERENCES "CloudFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_pdfFileId_fkey" FOREIGN KEY ("pdfFileId") REFERENCES "CloudFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "CloudFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
