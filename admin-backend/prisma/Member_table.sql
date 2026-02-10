-- Member table (current schema)
-- SQLite; aligns with Prisma schema Member model.
-- Profile: name, surname, nationalType, citizenId/passport, sex, birthdate, mobile, email, pointBalance.
-- Address: addr_addressNo, addr_building, addr_road, addr_soi, addr_subdistrict, addr_district, addr_province, addr_postalCode.

CREATE TABLE "Member" (
    "id"                TEXT    NOT NULL PRIMARY KEY,
    "memberId"          TEXT    NOT NULL UNIQUE,
    "lineUserId"        TEXT    UNIQUE,
    "memberLevelId"      TEXT,
    "name"              TEXT    NOT NULL,
    "surname"           TEXT    NOT NULL,
    "nationalType"      TEXT    NOT NULL,   -- THAI | OTHER
    "citizenId"         TEXT,
    "passport"          TEXT,
    "sex"               TEXT    NOT NULL,   -- M | F
    "birthdate"         DATE    NOT NULL,
    "mobile"            TEXT    NOT NULL,
    "email"             TEXT,
    "displayName"       TEXT,
    "channel"           TEXT,   -- LINE | WEB | MOBILE
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

CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Member_lineUserId_key" ON "Member"("lineUserId");
