/**
 * One-time migration: update Member.gender from M/F/OTHER to 1=Male, 2=Female.
 * Run: npx ts-node prisma/scripts/migrate-gender-to-1-2.ts
 * Or with DATABASE_URL set for Render: node node_modules/ts-node/dist/bin.js prisma/scripts/migrate-gender-to-1-2.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const m = await prisma.member.updateMany({ where: { gender: 'M' }, data: { gender: '1' } });
  const f = await prisma.member.updateMany({ where: { gender: 'F' }, data: { gender: '2' } });
  const other = await prisma.member.updateMany({
    where: { gender: { notIn: ['1', '2'] } },
    data: { gender: '1' },
  });
  console.log('Gender migration: M->1:', m.count, ', F->2:', f.count, ', other->1:', other.count);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
