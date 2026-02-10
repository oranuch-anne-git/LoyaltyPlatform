-- channel: allow NULL (LINE | WEB | MOBILE)
-- SQLite: recreate table

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
    "channel"           TEXT,
    "consentPDPA"       BOOLEAN NOT NULL DEFAULT false,
    "consentAt"         DATETIME,
    "active"            BOOLEAN NOT NULL DEFAULT true,
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

INSERT INTO "Member_new" SELECT * FROM "Member";

DROP TABLE "Member";
ALTER TABLE "Member_new" RENAME TO "Member";

CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Member_lineUserId_key" ON "Member"("lineUserId");

PRAGMA foreign_keys = ON;
