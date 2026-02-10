-- Add privilegeDetail (text), migrate benefit fields into it as newline-separated lines, then drop those columns.
-- Requires SQLite 3.35+ for DROP COLUMN.

ALTER TABLE "MemberLevel" ADD COLUMN "privilegeDetail" TEXT;

-- Build privilegeDetail from existing columns (one line per field)
UPDATE "MemberLevel" SET "privilegeDetail" =
  'minSpendingThresholdBaht: ' || COALESCE(CAST("minSpendingThresholdBaht" AS TEXT), '') || char(10) ||
  'bahtPerPoint: ' || COALESCE(CAST("bahtPerPoint" AS TEXT), '') || char(10) ||
  'discountPercentage: ' || COALESCE(CAST("discountPercentage" AS TEXT), '') || char(10) ||
  'newCustomerBenefitText: ' || COALESCE("newCustomerBenefitText", '') || char(10) ||
  'birthdayBenefitDescription: ' || COALESCE("birthdayBenefitDescription", '') || char(10) ||
  'hasPriorityContactCenter: ' || CASE WHEN "hasPriorityContactCenter" THEN 'true' ELSE 'false' END || char(10) ||
  'emergencyAssistanceTimesPerYear: ' || COALESCE(CAST("emergencyAssistanceTimesPerYear" AS TEXT), '') || char(10) ||
  'redemptionPointsNeeded: ' || COALESCE(CAST("redemptionPointsNeeded" AS TEXT), '') || char(10) ||
  'redemptionDiscountBaht: ' || COALESCE(CAST("redemptionDiscountBaht" AS TEXT), '') || char(10) ||
  'pointsValidityYears: ' || COALESCE(CAST("pointsValidityYears" AS TEXT), '') || char(10) ||
  'pointsValidityMethod: ' || COALESCE("pointsValidityMethod", '');

-- Drop the benefit columns (keep id, code, name, sortOrder, privilegeDetail, createdAt, updatedAt)
ALTER TABLE "MemberLevel" DROP COLUMN "minSpendingThresholdBaht";
ALTER TABLE "MemberLevel" DROP COLUMN "bahtPerPoint";
ALTER TABLE "MemberLevel" DROP COLUMN "discountPercentage";
ALTER TABLE "MemberLevel" DROP COLUMN "newCustomerBenefitText";
ALTER TABLE "MemberLevel" DROP COLUMN "birthdayBenefitDescription";
ALTER TABLE "MemberLevel" DROP COLUMN "hasPriorityContactCenter";
ALTER TABLE "MemberLevel" DROP COLUMN "emergencyAssistanceTimesPerYear";
ALTER TABLE "MemberLevel" DROP COLUMN "redemptionPointsNeeded";
ALTER TABLE "MemberLevel" DROP COLUMN "redemptionDiscountBaht";
ALTER TABLE "MemberLevel" DROP COLUMN "pointsValidityYears";
ALTER TABLE "MemberLevel" DROP COLUMN "pointsValidityMethod";
