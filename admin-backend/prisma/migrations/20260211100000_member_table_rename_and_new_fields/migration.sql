-- Member table: rename columns and add new fields
-- Rename: name->firstName, surname->lastName, sex->gender, addr_postalCode->addr_zipCode
-- Remove: displayName
-- Add: crmId, addr_moo, addr_subdistrictCode, addr_districtCode, addr_provinceCode, addr_country

-- SQLite 3.25.0+ RENAME COLUMN
ALTER TABLE "Member" RENAME COLUMN "name" TO "firstName";
ALTER TABLE "Member" RENAME COLUMN "surname" TO "lastName";
ALTER TABLE "Member" RENAME COLUMN "sex" TO "gender";
ALTER TABLE "Member" RENAME COLUMN "addr_postalCode" TO "addr_zipCode";

-- SQLite 3.35.0+ DROP COLUMN (or use table recreate on older SQLite)
ALTER TABLE "Member" DROP COLUMN "displayName";

-- Add new columns
ALTER TABLE "Member" ADD COLUMN "crmId" TEXT;
ALTER TABLE "Member" ADD COLUMN "addr_moo" TEXT;
ALTER TABLE "Member" ADD COLUMN "addr_subdistrictCode" TEXT;
ALTER TABLE "Member" ADD COLUMN "addr_districtCode" TEXT;
ALTER TABLE "Member" ADD COLUMN "addr_provinceCode" TEXT;
ALTER TABLE "Member" ADD COLUMN "addr_country" TEXT;
