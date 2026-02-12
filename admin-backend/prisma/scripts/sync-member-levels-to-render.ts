/**
 * Update only the privilege text (privilegeTh, privilegeEn) for Yellow, Silver, Black
 * in the database given by DATABASE_URL. Use this to fix Render when it shows short text.
 *
 * Run from your machine with Render's EXTERNAL Database URL:
 *   set DATABASE_URL=postgresql://user:pass@dpg-xxxx-external..../db?sslmode=require
 *   cd admin-backend && npm run prisma:sync-member-levels
 *
 * Or from Render Shell (cd to admin-backend first):
 *   node node_modules/ts-node/dist/bin.js prisma/scripts/sync-member-levels-to-render.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FULL_PRIVILEGE = {
  YELLOW: {
    privilegeTh:
      'ลูกค้าใหม่\n25 บาท = 1 คะแนน\nส่วนลด 3%\nโปรโมชั่นพิเศษในวันเกิด / คะแนนพิเศษ\n800 คะแนน แลกรับส่วนลด 100 บาท\nคะแนนมีอายุ 3 ปีนับจากวันที่ได้รับ (การนับคะแนนหมดอายุจะนับตามปีปฏิทิน)',
    privilegeEn:
      'New Customer\n25 Baht = 1 Point\nDiscount 3%\nBirthday Promotion / Special Point\nRedeem 800 points for discounts 100 Baht\nEach point valid 3 years from date received (expiration follows calendar year)',
  },
  SILVER: {
    privilegeTh:
      'ยอดใช้จ่ายสะสม 50,000 บาท\n25 บาท = 1 คะแนน\nส่วนลด 5%\nโปรโมชั่นพิเศษในวันเกิด / คะแนนพิเศษ / ของขวัญวันเกิด\nช่วยเหลือฉุกเฉินนอกสถานที่ 1 ครั้ง/ปี\n800 คะแนน แลกรับส่วนลด 100 บาท\nคะแนนมีอายุ 3 ปีนับจากวันที่ได้รับ',
    privilegeEn:
      'Accumulated spend 50,000 Baht\n25 Baht = 1 Point\nDiscount 5%\nBirthday Promotion / Special Point / Birthday Gift\nEmergency assistance 1 time/year\nRedeem 800 points for discount 100 Baht\nPoints valid 3 years from date received',
  },
  BLACK: {
    privilegeTh:
      'ยอดใช้จ่ายสะสม 100,000 บาท\n25 บาท = 1 คะแนน\nส่วนลด 7%\nบริการ Contact Center ทันที\nโปรโมชั่นพิเศษในวันเกิด / คะแนนพิเศษ / ของขวัญวันเกิด\nช่วยเหลือฉุกเฉินนอกสถานที่ 2 ครั้ง/ปี\n800 คะแนน แลกรับส่วนลด 100 บาท\nคะแนนมีอายุ 3 ปีนับจากวันที่ได้รับ',
    privilegeEn:
      'Accumulated spend 100,000 Baht\n25 Baht = 1 Point\nDiscount 7%\nPriority Contact Center\nBirthday Promotion / Special Point / Birthday Gift\nEmergency assistance 2 times/year\nRedeem 800 points for discount 100 Baht\nPoints valid 3 years from date received',
  },
} as const;

async function main() {
  console.log('Updating member level privilege text (target DB from DATABASE_URL)...');

  for (const code of ['YELLOW', 'SILVER', 'BLACK'] as const) {
    const { privilegeTh, privilegeEn } = FULL_PRIVILEGE[code];
    const result = await prisma.memberLevel.updateMany({
      where: { code },
      data: { privilegeTh, privilegeEn },
    });
    console.log('  ', code, ':', result.count, 'row(s) updated');
  }

  console.log('Done. Refresh the Member Levels page on Render.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
