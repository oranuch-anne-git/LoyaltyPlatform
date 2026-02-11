-- Rename privilegeDetail to privilegeTh and add privilegeEn (SQLite 3.25+ RENAME COLUMN)
ALTER TABLE "MemberLevel" RENAME COLUMN "privilegeDetail" TO "privilegeTh";
ALTER TABLE "MemberLevel" ADD COLUMN "privilegeEn" TEXT;
