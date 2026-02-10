-- name, surname, nationalType, sex, birthdate, mobile, channel: NOT NULL, no DEFAULT
-- SQLite: recreate table and copy data

PRAGMA foreign_keys = OFF;

CREATE TABLE "Member_new" (
    "id"                TEXT NOT NULL PRIMARY KEY,
    "memberId"          TEXT NOT NULL,
    "lineUserId"        TEXT,
    "name"              TEXT NOT NULL,
    "surname"           TEXT NOT NULL,
    "nationalType"      TEXT NOT NULL,
    "citizenId"         TEXT,
    "passport"          TEXT,
    "sex"               TEXT NOT NULL,
    "birthdate"         DATE NOT NULL,
    "mobile"            TEXT NOT NULL,
    "email"             TEXT,
    "displayName"       TEXT,
    "channel"           TEXT NOT NULL,
    "consentPDPA"       BOOLEAN NOT NULL DEFAULT false,
    "consentAt"         DATETIME,
    "active"             BOOLEAN NOT NULL DEFAULT true,
    "createdAt"         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         DATETIME NOT NULL,
    "pointBalance"      INTEGER NOT NULL DEFAULT 0,
    "addr_addressNo"    TEXT,
    "addr_building"     TEXT,
    "addr_road"         TEXT,
    "addr_soi"          TEXT,
    "addr_subdistrict"  TEXT,
    "addr_district"     TEXT,
    "addr_province"     TEXT,
    "addr_postalCode"   TEXT
);

INSERT INTO "Member_new" (
    "id", "memberId", "lineUserId", "name", "surname", "nationalType", "citizenId", "passport",
    "sex", "birthdate", "mobile", "email", "displayName", "channel", "consentPDPA", "consentAt",
    "active", "createdAt", "updatedAt", "pointBalance",
    "addr_addressNo", "addr_building", "addr_road", "addr_soi", "addr_subdistrict", "addr_district", "addr_province", "addr_postalCode"
) SELECT
    "id", "memberId", "lineUserId",
    COALESCE("name", ''),
    COALESCE("surname", ''),
    COALESCE("nationalType", 'OTHER'),
    "citizenId", "passport",
    COALESCE("sex", 'M'),
    COALESCE("birthdate", '1970-01-01'),
    COALESCE("mobile", ''),
    "email", "displayName",
    COALESCE("channel", 'LINE'),
    "consentPDPA", "consentAt",
    "active", "createdAt", "updatedAt", "pointBalance",
    "addr_addressNo", "addr_building", "addr_road", "addr_soi", "addr_subdistrict", "addr_district", "addr_province", "addr_postalCode"
FROM "Member";

DROP TABLE "Member";
ALTER TABLE "Member_new" RENAME TO "Member";

CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Member_lineUserId_key" ON "Member"("lineUserId");

PRAGMA foreign_keys = ON;
