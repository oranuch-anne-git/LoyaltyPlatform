/**
 * Print what's in MemberLevel in the DB (DATABASE_URL). Use to verify sync or debug.
 * Run: DATABASE_URL=... npx ts-node prisma/scripts/verify-member-levels-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const levels = await prisma.memberLevel.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log('MemberLevel rows:', levels.length);
  for (const l of levels) {
    const thLen = (l.privilegeTh ?? '').length;
    const enLen = (l.privilegeEn ?? '').length;
    const thPreview = (l.privilegeTh ?? '').slice(0, 80).replace(/\n/g, ' ');
    console.log('  ', l.code, '| privilegeTh length:', thLen, '| preview:', thPreview + (thLen > 80 ? '...' : ''));
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
