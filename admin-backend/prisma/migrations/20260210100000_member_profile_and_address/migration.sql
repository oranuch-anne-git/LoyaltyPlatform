-- Add new Member profile and address columns
ALTER TABLE "Member" ADD COLUMN "name" TEXT;
ALTER TABLE "Member" ADD COLUMN "surname" TEXT;
ALTER TABLE "Member" ADD COLUMN "nationalType" TEXT;
ALTER TABLE "Member" ADD COLUMN "citizenId" TEXT;
ALTER TABLE "Member" ADD COLUMN "passport" TEXT;
ALTER TABLE "Member" ADD COLUMN "birthdate" DATETIME;
ALTER TABLE "Member" ADD COLUMN "mobile" TEXT;
ALTER TABLE "Member" ADD COLUMN "addressNo" TEXT;
ALTER TABLE "Member" ADD COLUMN "building" TEXT;
ALTER TABLE "Member" ADD COLUMN "road" TEXT;
ALTER TABLE "Member" ADD COLUMN "soi" TEXT;
ALTER TABLE "Member" ADD COLUMN "subdistrict" TEXT;
ALTER TABLE "Member" ADD COLUMN "district" TEXT;
ALTER TABLE "Member" ADD COLUMN "province" TEXT;
ALTER TABLE "Member" ADD COLUMN "postalCode" TEXT;

-- Copy existing data
UPDATE "Member" SET "mobile" = "phone", "birthdate" = "birthday" WHERE "id" IS NOT NULL;

-- Drop old columns (SQLite 3.35+)
ALTER TABLE "Member" DROP COLUMN "phone";
ALTER TABLE "Member" DROP COLUMN "birthday";
ALTER TABLE "Member" DROP COLUMN "nationalId";
ALTER TABLE "Member" DROP COLUMN "address";
