-- Rename address columns to addr_ prefix; birthdate as DATE default
-- SQLite 3.25+ RENAME COLUMN

ALTER TABLE "Member" RENAME COLUMN "addressNo" TO "addr_addressNo";
ALTER TABLE "Member" RENAME COLUMN "building" TO "addr_building";
ALTER TABLE "Member" RENAME COLUMN "road" TO "addr_road";
ALTER TABLE "Member" RENAME COLUMN "soi" TO "addr_soi";
ALTER TABLE "Member" RENAME COLUMN "subdistrict" TO "addr_subdistrict";
ALTER TABLE "Member" RENAME COLUMN "district" TO "addr_district";
ALTER TABLE "Member" RENAME COLUMN "province" TO "addr_province";
ALTER TABLE "Member" RENAME COLUMN "postalCode" TO "addr_postalCode";
