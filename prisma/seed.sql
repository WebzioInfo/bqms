-- BQMS Enterprise SQL Seed Script
-- Note: Due to the complexity of UUID/CUID foreign key relationships across 40+ tables,
-- this script serves as the static SQL pattern. For full algorithmic generation with
-- 10,000+ realistic sensor values and names, use the provided `prisma/seed.ts` script.

-- 1. CLEAN UP
TRUNCATE TABLE "Organization" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- 2. ORGANIZATIONS
INSERT INTO "Organization" (id, name, slug, type, "erpReferenceId", "trustScore", email, phone, address, "batchBlockSetting", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'Aqua Pure Waters', 'aqua-pure-waters', 'MINERAL_WATER', 'ERP-AQUA-01', 95.5, 'contact@aquapure.com', '+1-555-0100', '123 Water St', 'WARN', NOW(), NOW()),
  (gen_random_uuid()::text, 'Crystal Clear Beverages', 'crystal-clear', 'MINERAL_WATER', 'ERP-CRYSTAL-02', 88.0, 'info@crystalclear.com', '+1-555-0101', '456 Clear Ave', 'WARN', NOW(), NOW());

-- 3. USERS
INSERT INTO "User" (id, email, "passwordHash", name, role, "organizationId", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'admin@aquapure.com', '$2a$10$xyz...', 'John Smith', 'QC_USER', (SELECT id FROM "Organization" WHERE slug = 'aqua-pure-waters'), NOW(), NOW());

-- 4. BATCHES
INSERT INTO "Batch" (id, "batchNumber", "organizationId", "productionDate", "verificationStatus", "isDeleted", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'B-AQU-001', (SELECT id FROM "Organization" WHERE slug = 'aqua-pure-waters'), NOW(), 'VERIFIED', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'B-CRY-001', (SELECT id FROM "Organization" WHERE slug = 'crystal-clear'), NOW(), 'PENDING', false, NOW(), NOW());

-- 5. ASSETS
INSERT INTO "Asset" (id, "organizationId", "assetCode", name, type, status, "createdAt")
VALUES 
  (gen_random_uuid(), (SELECT id FROM "Organization" WHERE slug = 'aqua-pure-waters'), 'AST-AQU-001', 'RO Plant 1', 'PRODUCTION', 'ACTIVE', NOW());

-- 6. NCR
INSERT INTO "NCR" (id, "organizationId", "ncrNumber", description, "reportedBy", status, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), (SELECT id FROM "Organization" WHERE slug = 'aqua-pure-waters'), 'NCR-001', 'High pH detected in RO permeate.', (SELECT id FROM "User" WHERE email = 'admin@aquapure.com'), 'OPEN', NOW(), NOW());

-- 7. CAPA
INSERT INTO "CAPA" (id, "ncrId", "organizationId", "capaNumber", description, status, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), (SELECT id FROM "NCR" WHERE "ncrNumber" = 'NCR-001'), (SELECT id FROM "Organization" WHERE slug = 'aqua-pure-waters'), 'CAPA-001', 'Replace RO Membranes.', 'IN_PROGRESS', NOW(), NOW());
