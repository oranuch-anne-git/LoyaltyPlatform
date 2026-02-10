"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
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
//# sourceMappingURL=clear-sample-data.js.map