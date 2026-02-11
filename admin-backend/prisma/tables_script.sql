-- Loyalty Platform – full table script (SQLite)
-- Run in order. Prefix /api for base path.

-- Role
CREATE TABLE "Role" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "name"        TEXT NOT NULL UNIQUE,
    "permissions" TEXT NOT NULL DEFAULT '[]'
);

-- AdminUser
CREATE TABLE "AdminUser" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "email"        TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name"         TEXT,
    "roleId"       TEXT NOT NULL,
    "active"       BOOLEAN NOT NULL DEFAULT true,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    DATETIME NOT NULL,
    CONSTRAINT "AdminUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id")
);

-- MemberLevel (Yellow, Silver, Black) – privilegeDetail = newline-separated benefit text
CREATE TABLE "MemberLevel" (
    "id"              TEXT NOT NULL PRIMARY KEY,
    "code"            TEXT NOT NULL UNIQUE,
    "name"            TEXT NOT NULL,
    "sortOrder"       INTEGER NOT NULL DEFAULT 0,
    "privilegeDetail" TEXT,
    "createdAt"       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       DATETIME NOT NULL
);
CREATE UNIQUE INDEX "MemberLevel_code_key" ON "MemberLevel"("code");

-- Province, District, Subdistrict (Thailand address master)
CREATE TABLE "Province" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "code"       TEXT NOT NULL UNIQUE,
    "nameTh"     TEXT NOT NULL,
    "nameEn"     TEXT,
    "sortOrder"  INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX "Province_code_key" ON "Province"("code");

CREATE TABLE "District" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "provinceId"  TEXT NOT NULL,
    "code"        TEXT NOT NULL,
    "nameTh"      TEXT NOT NULL,
    "nameEn"      TEXT,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province" ("id")
);
CREATE UNIQUE INDEX "District_provinceId_code_key" ON "District"("provinceId", "code");

CREATE TABLE "Subdistrict" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "districtId"  TEXT NOT NULL,
    "code"        TEXT NOT NULL,
    "nameTh"      TEXT NOT NULL,
    "nameEn"      TEXT,
    "zipCode"     TEXT,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Subdistrict_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District" ("id")
);
CREATE UNIQUE INDEX "Subdistrict_districtId_code_key" ON "Subdistrict"("districtId", "code");

-- Member
CREATE TABLE "Member" (
    "id"                    TEXT NOT NULL PRIMARY KEY,
    "memberId"              TEXT NOT NULL UNIQUE,
    "crmId"                 TEXT,
    "lineUserId"            TEXT UNIQUE,
    "levelCode"             TEXT,
    "firstName"             TEXT NOT NULL,
    "lastName"              TEXT NOT NULL,
    "nationalType"          TEXT NOT NULL,   -- THAI | OTHER
    "citizenId"             TEXT,
    "passport"              TEXT,
    "gender"                TEXT NOT NULL,   -- M | F
    "birthdate"             DATETIME,
    "mobile"                TEXT NOT NULL,
    "email"                 TEXT,
    "channel"               TEXT,   -- LINE | WEB | MOBILE
    "consentPDPA"           BOOLEAN NOT NULL DEFAULT false,
    "consentAt"             DATETIME,
    "active"                BOOLEAN NOT NULL DEFAULT true,
    "createdAt"             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             DATETIME NOT NULL,
    "pointBalance"         INTEGER NOT NULL DEFAULT 0,
    "addr_addressNo"        TEXT,
    "addr_building"         TEXT,
    "addr_road"             TEXT,
    "addr_soi"              TEXT,
    "addr_moo"              TEXT,
    "addr_subdistrict"      TEXT,
    "addr_subdistrictCode" TEXT,
    "addr_district"         TEXT,
    "addr_districtCode"     TEXT,
    "addr_province"         TEXT,
    "addr_provinceCode"     TEXT,
    "addr_zipCode"          TEXT,
    "addr_country"          TEXT
);
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Member_lineUserId_key" ON "Member"("lineUserId");

-- PointLedger
CREATE TABLE "PointLedger" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "memberId"    TEXT NOT NULL,
    "balance"     INTEGER NOT NULL,
    "change"      INTEGER NOT NULL,
    "type"        TEXT NOT NULL,
    "referenceId" TEXT,
    "expiresAt"   DATETIME,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PointLedger_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id")
);

-- PointTransaction
CREATE TABLE "PointTransaction" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "memberId"    TEXT NOT NULL,
    "amount"      INTEGER NOT NULL,
    "type"        TEXT NOT NULL,
    "referenceId" TEXT,
    "branchId"    TEXT,
    "metadata"    TEXT,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PointTransaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id")
);

-- Reward
CREATE TABLE "Reward" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "category"    TEXT NOT NULL,
    "partnerId"   TEXT,
    "pointCost"   INTEGER NOT NULL,
    "quantity"    INTEGER NOT NULL DEFAULT -1,
    "validFrom"   DATETIME,
    "validTo"     DATETIME,
    "active"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL
);

-- Redemption
CREATE TABLE "Redemption" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "memberId"  TEXT NOT NULL,
    "rewardId"  TEXT NOT NULL,
    "pointsUsed" INTEGER NOT NULL,
    "status"    TEXT NOT NULL DEFAULT 'COMPLETED',
    "branchId"   TEXT,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Redemption_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id"),
    CONSTRAINT "Redemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward" ("id")
);

-- Campaign
CREATE TABLE "Campaign" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "name"        TEXT NOT NULL,
    "type"        TEXT NOT NULL,
    "description" TEXT,
    "conditions"  TEXT,
    "config"      TEXT,
    "validFrom"   DATETIME NOT NULL,
    "validTo"     DATETIME NOT NULL,
    "active"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL
);

-- Banner
CREATE TABLE "Banner" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT,
    "title"      TEXT NOT NULL,
    "imageUrl"   TEXT,
    "linkUrl"    TEXT,
    "sortOrder"  INTEGER NOT NULL DEFAULT 0,
    "active"     BOOLEAN NOT NULL DEFAULT true,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Branch
CREATE TABLE "Branch" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "code"      TEXT NOT NULL UNIQUE,
    "name"      TEXT NOT NULL,
    "address"   TEXT,
    "region"    TEXT,
    "active"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- NotificationLog
CREATE TABLE "NotificationLog" (
    "id"       TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT,
    "channel"  TEXT NOT NULL,
    "type"     TEXT NOT NULL,
    "payload"  TEXT,
    "sentAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status"   TEXT NOT NULL DEFAULT 'SENT'
);

-- AuditLog
CREATE TABLE "AuditLog" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "adminId"   TEXT,
    "action"    TEXT NOT NULL,
    "resource"  TEXT NOT NULL,
    "resourceId" TEXT,
    "details"   TEXT,
    "ip"        TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser" ("id")
);
