-- Member table (current schema)
-- SQLite; aligns with Prisma schema Member model.
-- Profile: firstName, lastName, nationalType, citizenId/passport, gender, birthdate, mobile, email, pointBalance.
-- Address: addr_addressNo, addr_building, addr_road, addr_soi, addr_moo, addr_subdistrict, addr_subdistrictCode,
--          addr_district, addr_districtCode, addr_province, addr_provinceCode, addr_zipCode, addr_country.
-- Address codes/names may reference master data in Province, District, Subdistrict (see tables_script.sql).

CREATE TABLE "Member" (
    "id"                    TEXT    NOT NULL PRIMARY KEY,
    "memberId"              TEXT    NOT NULL UNIQUE,
    "crmId"                 TEXT,
    "lineUserId"            TEXT    UNIQUE,
    "levelCode"             TEXT,
    "firstName"             TEXT    NOT NULL,
    "lastName"              TEXT    NOT NULL,
    "nationalType"          TEXT    NOT NULL,   -- THAI | OTHER
    "citizenId"             TEXT,
    "passport"              TEXT,
    "gender"                TEXT    NOT NULL,   -- M | F
    "birthdate"             DATETIME,
    "mobile"                TEXT    NOT NULL,
    "email"                 TEXT,
    "channel"               TEXT,   -- LINE | WEB | MOBILE
    "consentPDPA"           BOOLEAN NOT NULL DEFAULT false,
    "consentAt"             DATETIME,
    "active"                BOOLEAN NOT NULL DEFAULT true,
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

CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Member_lineUserId_key" ON "Member"("lineUserId");
