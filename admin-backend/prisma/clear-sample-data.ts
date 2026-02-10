/**
 * Clear all sample/demo data. Keeps Role and AdminUser so admin login still works.
 * Run: npm run prisma:clear (from admin-backend folder)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete in dependency order (child tables first)
  await prisma.auditLog.deleteMany({});
  await prisma.pointLedger.deleteMany({});
  await prisma.pointTransaction.deleteMany({});
  await prisma.redemption.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.reward.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.notificationLog.deleteMany({});

  console.log('Sample data cleared.');
  console.log('Kept: Role, AdminUser (admin@loyalty.local still works).');
  console.log('Cleared: Members, Rewards, Campaigns, Banners, Branches, PointLedger, PointTransaction, Redemptions, AuditLog, NotificationLog.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
