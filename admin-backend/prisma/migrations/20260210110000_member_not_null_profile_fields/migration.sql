-- Make name, surname, nationalType, sex, birthdate, mobile NOT NULL with defaults
-- SQLite: recreate table and copy data (ALTER COLUMN not supported)

PRAGMA foreign_keys = OFF;

CREATE TABLE "Member_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "lineUserId" TEXT,
    "name" TEXT NOT NULL DEFAULT '',
    "surname" TEXT NOT NULL DEFAULT '',
    "nationalType" TEXT NOT NULL DEFAULT 'OTHER',
    "citizenId" TEXT,
    "passport" TEXT,
    "sex" TEXT NOT NULL DEFAULT 'OTHER',
    "birthdate" DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00',
    "mobile" TEXT NOT NULL DEFAULT '',
    "email" TEXT,
    "displayName" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'LINE',
    "consentPDPA" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "pointBalance" INTEGER NOT NULL DEFAULT 0,
    "addressNo" TEXT,
    "building" TEXT,
    "road" TEXT,
    "soi" TEXT,
    "subdistrict" TEXT,
    "district" TEXT,
    "province" TEXT,
    "postalCode" TEXT
);

INSERT INTO "Member_new" (
    "id", "memberId", "lineUserId", "name", "surname", "nationalType", "citizenId", "passport",
    "sex", "birthdate", "mobile", "email", "displayName", "channel", "consentPDPA", "consentAt",
    "active", "createdAt", "updatedAt", "pointBalance",
    "addressNo", "building", "road", "soi", "subdistrict", "district", "province", "postalCode"
) SELECT
    "id", "memberId", "lineUserId",
    COALESCE("name", ''),
    COALESCE("surname", ''),
    COALESCE("nationalType", 'OTHER'),
    "citizenId", "passport",
    COALESCE("sex", 'OTHER'),
    COALESCE("birthdate", '1970-01-01 00:00:00'),
    COALESCE("mobile", ''),
    "email", "displayName", "channel", "consentPDPA", "consentAt",
    "active", "createdAt", "updatedAt", "pointBalance",
    "addressNo", "building", "road", "soi", "subdistrict", "district", "province", "postalCode"
FROM "Member";

DROP TABLE "Member";

ALTER TABLE "Member_new" RENAME TO "Member";

CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Member_lineUserId_key" ON "Member"("lineUserId");

PRAGMA foreign_keys = ON;
