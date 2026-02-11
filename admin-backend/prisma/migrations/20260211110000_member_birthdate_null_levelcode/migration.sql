-- Member: birthdate nullable; memberLevelId -> levelCode
-- Recreate Member with levelCode (from MemberLevel.code) and birthdate NULL. PRAGMA foreign_keys = OFF to allow DROP.

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS "Member_new";

CREATE TABLE "Member_new" (
    "id"                    TEXT    NOT NULL PRIMARY KEY,
    "memberId"              TEXT    NOT NULL,
    "crmId"                 TEXT,
    "lineUserId"            TEXT,
    "levelCode"             TEXT,
    "firstName"             TEXT    NOT NULL,
    "lastName"              TEXT    NOT NULL,
    "nationalType"          TEXT    NOT NULL,
    "citizenId"             TEXT,
    "passport"              TEXT,
    "gender"                TEXT    NOT NULL,
    "birthdate"             DATETIME,
    "mobile"                TEXT    NOT NULL,
    "email"                 TEXT,
    "channel"               TEXT,
    "consentPDPA"           BOOLEAN NOT NULL DEFAULT 0,
    "consentAt"             DATETIME,
    "active"                BOOLEAN NOT NULL DEFAULT 1,
    "createdAt"             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             DATETIME NOT NULL,
    "pointBalance"          INTEGER NOT NULL DEFAULT 0,
    "addr_addressNo"        TEXT,
    "addr_building"         TEXT,
    "addr_road"             TEXT,
    "addr_soi"              TEXT,
    "addr_moo"              TEXT,
    "addr_subdistrict"      TEXT,
    "addr_subdistrictCode"  TEXT,
    "addr_district"         TEXT,
    "addr_districtCode"     TEXT,
    "addr_province"         TEXT,
    "addr_provinceCode"     TEXT,
    "addr_zipCode"          TEXT,
    "addr_country"          TEXT
);

INSERT INTO "Member_new" SELECT
    "id", "memberId", "crmId", "lineUserId",
    (SELECT "code" FROM "MemberLevel" WHERE "MemberLevel"."id" = "Member"."memberLevelId"),
    "firstName", "lastName", "nationalType", "citizenId", "passport", "gender", "birthdate",
    "mobile", "email", "channel", "consentPDPA", "consentAt", "active", "createdAt", "updatedAt", "pointBalance",
    "addr_addressNo", "addr_building", "addr_road", "addr_soi", "addr_moo", "addr_subdistrict", "addr_subdistrictCode",
    "addr_district", "addr_districtCode", "addr_province", "addr_provinceCode", "addr_zipCode", "addr_country"
FROM "Member";

DROP TABLE "Member";

ALTER TABLE "Member_new" RENAME TO "Member";

CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Member_lineUserId_key" ON "Member"("lineUserId");

PRAGMA foreign_keys = ON;
