-- Add benefit fields to MemberLevel and backfill Yellow, Silver, Black sample data
-- No DEFAULT on new columns (SQLite ALTER TABLE does not allow non-constant defaults).

ALTER TABLE "MemberLevel" ADD COLUMN "minSpendingThresholdBaht" INTEGER;
ALTER TABLE "MemberLevel" ADD COLUMN "bahtPerPoint" INTEGER;
ALTER TABLE "MemberLevel" ADD COLUMN "discountPercentage" REAL;
ALTER TABLE "MemberLevel" ADD COLUMN "newCustomerBenefitText" TEXT;
ALTER TABLE "MemberLevel" ADD COLUMN "birthdayBenefitDescription" TEXT;
ALTER TABLE "MemberLevel" ADD COLUMN "hasPriorityContactCenter" BOOLEAN;
ALTER TABLE "MemberLevel" ADD COLUMN "emergencyAssistanceTimesPerYear" INTEGER;
ALTER TABLE "MemberLevel" ADD COLUMN "redemptionPointsNeeded" INTEGER;
ALTER TABLE "MemberLevel" ADD COLUMN "redemptionDiscountBaht" INTEGER;
ALTER TABLE "MemberLevel" ADD COLUMN "pointsValidityYears" INTEGER;
ALTER TABLE "MemberLevel" ADD COLUMN "pointsValidityMethod" TEXT;
ALTER TABLE "MemberLevel" ADD COLUMN "createdAt" DATETIME;
ALTER TABLE "MemberLevel" ADD COLUMN "updatedAt" DATETIME;

-- Yellow Card: entry, 25 Baht/point, 3% discount, new customer, birthday promo, 800 pts = 100 Baht, 3 yr calendar
UPDATE "MemberLevel" SET
  "name" = 'Yellow Card',
  "minSpendingThresholdBaht" = 0,
  "bahtPerPoint" = 25,
  "discountPercentage" = 3.0,
  "newCustomerBenefitText" = 'ลูกค้าใหม่ (New customer)',
  "birthdayBenefitDescription" = 'โปรโมชั่นพิเศษในวันเกิด / คะแนนพิเศษ (Special promotion on birthday / special points)',
  "hasPriorityContactCenter" = 0,
  "emergencyAssistanceTimesPerYear" = 0,
  "redemptionPointsNeeded" = 800,
  "redemptionDiscountBaht" = 100,
  "pointsValidityYears" = 3,
  "pointsValidityMethod" = 'calendar_year',
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'YELLOW';

-- Silver Card: 50,000 Baht, 25 Baht/point, 5% discount, birthday + gift, emergency 1x/year, 800 pts = 100 Baht
UPDATE "MemberLevel" SET
  "name" = 'Silver Card',
  "minSpendingThresholdBaht" = 50000,
  "bahtPerPoint" = 25,
  "discountPercentage" = 5.0,
  "newCustomerBenefitText" = NULL,
  "birthdayBenefitDescription" = 'โปรโมชั่นพิเศษในวันเกิด / คะแนนพิเศษ / ของขวัญวันเกิด (Special promotion on birthday / special points / birthday gift)',
  "hasPriorityContactCenter" = 0,
  "emergencyAssistanceTimesPerYear" = 1,
  "redemptionPointsNeeded" = 800,
  "redemptionDiscountBaht" = 100,
  "pointsValidityYears" = 3,
  "pointsValidityMethod" = 'calendar_year',
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'SILVER';

-- Black Card: 100,000 Baht, 25 Baht/point, 7% discount, Contact Center, birthday + gift, emergency 2x/year
UPDATE "MemberLevel" SET
  "name" = 'Black Card',
  "minSpendingThresholdBaht" = 100000,
  "bahtPerPoint" = 25,
  "discountPercentage" = 7.0,
  "newCustomerBenefitText" = NULL,
  "birthdayBenefitDescription" = 'โปรโมชั่นพิเศษในวันเกิด / คะแนนพิเศษ / ของขวัญวันเกิด (Special promotion on birthday / special points / birthday gift)',
  "hasPriorityContactCenter" = 1,
  "emergencyAssistanceTimesPerYear" = 2,
  "redemptionPointsNeeded" = 800,
  "redemptionDiscountBaht" = 100,
  "pointsValidityYears" = 3,
  "pointsValidityMethod" = 'calendar_year',
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'BLACK';
