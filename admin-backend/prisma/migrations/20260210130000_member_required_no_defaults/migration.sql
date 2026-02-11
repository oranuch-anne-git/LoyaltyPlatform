-- Member: birthdate nullable; memberLevelId -> levelCode
-- 1) Add levelCode, 2) Copy code from MemberLevel where memberLevelId = MemberLevel.id, 3) Drop memberLevelId, 4) birthdate nullable

ALTER TABLE "Member" ADD COLUMN "levelCode" TEXT;

UPDATE "Member" SET "levelCode" = (SELECT "code" FROM "MemberLevel" WHERE "MemberLevel"."id" = "Member"."memberLevelId") WHERE "memberLevelId" IS NOT NULL;

ALTER TABLE "Member" DROP COLUMN "memberLevelId";

-- SQLite: make birthdate nullable by recreating (no ALTER COLUMN). Simpler: just allow NULL in app; SQLite is dynamically typed so existing rows stay.
-- Actually SQLite doesn't support ALTER COLUMN. So we leave the column as-is; Prisma will treat it as optional. For strict NULL we'd need table recreate.
-- So only do: Add levelCode, copy, drop memberLevelId. birthdate in SQLite remains NOT NULL in the table definition but we can insert NULL if we alter.
-- Check: In SQLite 3.37.0+ we have ALTER TABLE table_name DROP COLUMN. We don't have "ALTER COLUMN SET NULL".
-- So the migration is: add levelCode, update levelCode from join, drop memberLevelId. birthdate: Prisma schema says DateTime? so we need the column to accept NULL. In SQLite the only way is to recreate the table. So let's do a simple migration without birthdate change for now, and add a note. Or we recreate the Member table with birthdate NULL. That's complex. Simpler: just do levelCode and drop memberLevelId. For birthdate we document that app treats it as optional - and we could add a second migration that recreates Member with birthdate NULL. Actually in SQLite, if the column was created as NOT NULL, you can't insert NULL. So we must recreate the table to make birthdate nullable. Let me do a migration that: 1) Creates Member_new with levelCode and birthdate NULL, 2) Copies data (levelCode from join, birthdate as-is), 3) Drops Member, 4) Renames Member_new to Member. And we need to recreate indexes and FK from PointLedger, PointTransaction, Redemption. So we'd have to drop those FKs, recreate Member, re-create FKs. This is getting heavy. Simpler approach: only migrate memberLevelId -> levelCode in this migration. For birthdate, add a separate migration that uses SQLite's table recreate to make birthdate nullable. Or in one migration: create new Member table with correct schema (levelCode, birthdate NULL), copy data, drop old, rename. And we need to handle the other tables that reference Member - they reference Member(id) which we're keeping. So we don't need to touch PointLedger etc. We just: CREATE TABLE Member_new (...); INSERT INTO Member_new SELECT id, memberId, crmId, lineUserId, (SELECT code FROM MemberLevel WHERE id = Member.memberLevelId), firstName, lastName, ... birthdate, ... FROM Member; DROP TABLE Member; ALTER TABLE Member_new RENAME TO Member; CREATE UNIQUE INDEX ... So the new table has levelCode and birthdate as NULL allowed. Let me do that.
</think>
Checking SQLite migration approach for making birthdate nullable:
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
Read