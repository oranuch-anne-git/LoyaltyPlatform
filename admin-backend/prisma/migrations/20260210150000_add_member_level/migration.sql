-- MemberLevel table (Yellow, Silver, Black)
CREATE TABLE "MemberLevel" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "code"      TEXT NOT NULL UNIQUE,
    "name"      TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX "MemberLevel_code_key" ON "MemberLevel"("code");

INSERT INTO "MemberLevel" ("id", "code", "name", "sortOrder") VALUES
    ('a0000001-0001-4000-8000-000000000001', 'YELLOW', 'Yellow', 1),
    ('a0000002-0002-4000-8000-000000000002', 'SILVER', 'Silver', 2),
    ('a0000003-0003-4000-8000-000000000003', 'BLACK', 'Black', 3);

-- Add member level to Member
ALTER TABLE "Member" ADD COLUMN "memberLevelId" TEXT;
