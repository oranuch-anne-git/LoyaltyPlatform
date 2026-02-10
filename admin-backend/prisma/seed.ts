import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
}

function memberId(): string {
  return 'M' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

async function main() {
  // ----- Roles & Admin -----
  await Promise.all([
    prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      create: { name: 'SUPER_ADMIN', permissions: JSON.stringify(['*']) },
      update: {},
    }),
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      create: { name: 'ADMIN', permissions: JSON.stringify(['members:*', 'points:*', 'rewards:*', 'campaigns:*', 'analytics:read']) },
      update: {},
    }),
    prisma.role.upsert({
      where: { name: 'OPERATOR' },
      create: { name: 'OPERATOR', permissions: JSON.stringify(['members:read', 'points:adjust', 'rewards:read']) },
      update: {},
    }),
  ]);

  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  if (superAdminRole) {
    const email = 'admin@loyalty.local';
    const passwordHash = hashPassword('admin123', email);
    await prisma.adminUser.upsert({
      where: { email },
      create: { email, passwordHash, name: 'Platform Admin', roleId: superAdminRole.id },
      update: { passwordHash },
    });
  }
  // API Key user: used when obtaining JWT via API key (POST /api/auth/token). Not for password login.
  if (adminRole) {
    const apiKeyEmail = 'api-key@loyalty.local';
    const passwordHash = hashPassword(crypto.randomBytes(32).toString('hex'), apiKeyEmail);
    await prisma.adminUser.upsert({
      where: { email: apiKeyEmail },
      create: { email: apiKeyEmail, passwordHash, name: 'API Key Service', roleId: adminRole.id },
      update: { passwordHash },
    });
  }

  // ----- Branches -----
  const branches = await Promise.all([
    prisma.branch.upsert({ where: { code: 'BKK01' }, create: { code: 'BKK01', name: 'Bangkok Central', address: '123 Sukhumvit Rd', region: 'Bangkok' }, update: {} }),
    prisma.branch.upsert({ where: { code: 'BKK02' }, create: { code: 'BKK02', name: 'Bangkok Siam', address: '456 Rama I Rd', region: 'Bangkok' }, update: {} }),
    prisma.branch.upsert({ where: { code: 'CNX01' }, create: { code: 'CNX01', name: 'Chiang Mai Mall', address: '789 Nimman Rd', region: 'Chiang Mai' }, update: {} }),
    prisma.branch.upsert({ where: { code: 'HKT01' }, create: { code: 'HKT01', name: 'Phuket Beach', address: '321 Beach Rd', region: 'Phuket' }, update: {} }),
  ]);

  // ----- Members (demo) -----
  const levels = await prisma.memberLevel.findMany({ orderBy: { sortOrder: 'asc' } });
  const levelYellow = levels.find((l) => l.code === 'YELLOW')?.id;
  const levelSilver = levels.find((l) => l.code === 'SILVER')?.id;
  const levelBlack = levels.find((l) => l.code === 'BLACK')?.id;
  const birth = new Date('1990-01-15');
  const memberData = [
    { memberId: 'DEMO001', lineUserId: 'Uline001', name: 'Sara', surname: 'Chen', nationalType: 'THAI' as const, citizenId: '1234567890123', email: 'sara@example.com', mobile: '0812345001', displayName: 'Sara Chen', channel: 'LINE', sex: 'F' as const, birthdate: birth, consentPDPA: true, pointBalance: 1250, memberLevelId: levelBlack },
    { memberId: 'DEMO002', lineUserId: 'Uline002', name: 'James', surname: 'Wong', nationalType: 'OTHER' as const, passport: 'A12345678', email: 'james@example.com', mobile: '0812345002', displayName: 'James Wong', channel: 'LINE', sex: 'M' as const, birthdate: birth, consentPDPA: true, pointBalance: 480, memberLevelId: levelSilver },
    { memberId: 'DEMO003', lineUserId: null, name: 'Nina', surname: 'Smith', nationalType: 'OTHER' as const, passport: 'B87654321', email: 'nina@example.com', mobile: '0812345003', displayName: 'Nina Smith', channel: 'WEB', sex: 'F' as const, birthdate: birth, consentPDPA: true, pointBalance: 2100, memberLevelId: levelSilver },
    { memberId: 'DEMO004', lineUserId: null, name: 'Mike', surname: 'Lee', nationalType: 'THAI' as const, citizenId: '9876543210123', email: 'mike@example.com', mobile: '0812345004', displayName: 'Mike Lee', channel: 'WEB', sex: 'M' as const, birthdate: birth, consentPDPA: false, pointBalance: 90, memberLevelId: levelYellow },
    { memberId: 'DEMO005', lineUserId: null, name: 'Priya', surname: 'Patel', nationalType: 'OTHER' as const, passport: 'C11223344', email: 'priya@example.com', mobile: '0812345005', displayName: 'Priya Patel', channel: 'MOBILE', sex: 'F' as const, birthdate: birth, consentPDPA: true, pointBalance: 750, memberLevelId: levelYellow },
    { memberId: 'DEMO006', lineUserId: 'Uline006', name: 'Tom', surname: 'Brown', nationalType: 'THAI' as const, citizenId: '1112223334444', email: null, mobile: '0812345006', displayName: 'Tom Brown', channel: 'MOBILE', sex: 'M' as const, birthdate: birth, consentPDPA: true, pointBalance: 0, memberLevelId: undefined },
  ];

  const members: { id: string; memberId: string; pointBalance: number }[] = [];
  for (const m of memberData) {
    const created = await prisma.member.upsert({
      where: { memberId: m.memberId },
      create: {
        memberId: m.memberId,
        lineUserId: m.lineUserId ?? undefined,
        name: m.name,
        surname: m.surname,
        nationalType: m.nationalType,
        citizenId: (m as { citizenId?: string }).citizenId ?? undefined,
        passport: (m as { passport?: string }).passport ?? undefined,
        email: (m as { email?: string }).email ?? undefined,
        mobile: m.mobile,
        displayName: m.displayName ?? undefined,
        channel: m.channel,
        sex: m.sex,
        birthdate: m.birthdate,
        consentPDPA: m.consentPDPA,
        consentAt: m.consentPDPA ? new Date() : null,
        pointBalance: m.pointBalance,
        memberLevelId: (m as { memberLevelId?: string }).memberLevelId ?? null,
      },
      update: { pointBalance: m.pointBalance, memberLevelId: (m as { memberLevelId?: string }).memberLevelId ?? undefined },
    });
    members.push({ id: created.id, memberId: created.memberId, pointBalance: created.pointBalance });
  }

  // ----- Rewards -----
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const rewardData = [
    { name: '10% Off Next Purchase', description: 'Discount voucher', category: 'DISCOUNT', pointCost: 100, quantity: -1 },
    { name: 'Free Coffee', description: 'Partner cafe free drink', category: 'SERVICE', pointCost: 150, quantity: 500 },
    { name: 'VIP Lounge Access', description: '1-day lounge pass', category: 'PRIVILEGE', pointCost: 500, quantity: 100 },
    { name: '50 THB Cashback', description: 'Credit to account', category: 'DISCOUNT', pointCost: 200, quantity: -1 },
    { name: 'Premium Gift Set', description: 'Limited edition box', category: 'PRODUCT', pointCost: 800, quantity: 50 },
  ];
  const rewards: { id: string }[] = [];
  for (const r of rewardData) {
    const existing = await prisma.reward.findFirst({ where: { name: r.name } });
    if (existing) {
      rewards.push(existing);
    } else {
      const created = await prisma.reward.create({ data: { ...r, validFrom: now, validTo: nextYear, active: true } });
      rewards.push(created);
    }
  }
  const rewardIds = rewards.map((r) => r.id);

  // ----- Campaigns -----
  const validFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const validTo = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const campaignData = [
    { name: 'Welcome Bonus', type: 'CASHBACK', description: '100 points on first purchase', conditions: JSON.stringify({ segment: 'new' }), config: '{"points":100}' },
    { name: 'Double Points Week', type: 'CASHBACK', description: '2x points on all purchases', conditions: JSON.stringify({ branch: 'all' }), config: '{"multiplier":2}' },
    { name: 'Redemption Festival', type: 'REDEMPTION', description: 'Extra rewards available', conditions: JSON.stringify({ time: 'weekend' }), config: '{}' },
  ];
  const campaigns: { id: string }[] = [];
  for (const c of campaignData) {
    const existing = await prisma.campaign.findFirst({ where: { name: c.name } });
    if (existing) campaigns.push(existing);
    else campaigns.push(await prisma.campaign.create({ data: { ...c, validFrom, validTo, active: true } }));
  }

  // ----- Point history (ledger + transaction) for demo members (only if none exist) -----
  for (const member of members) {
    const hasLedger = await prisma.pointLedger.count({ where: { memberId: member.id } });
    if (hasLedger > 0 || member.pointBalance <= 0) continue;
    await prisma.pointLedger.create({ data: { memberId: member.id, balance: member.pointBalance, change: member.pointBalance, type: 'EARN', referenceId: campaigns[0].id, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    await prisma.pointTransaction.create({ data: { memberId: member.id, amount: member.pointBalance, type: 'PURCHASE', referenceId: campaigns[0].id, branchId: branches[0].id } });
  }

  // ----- Redemptions (Sara 2, James 1, Nina 1) - only if none exist for demo members -----
  const redemptionCount = await prisma.redemption.count({ where: { memberId: members[0]?.id } });
  if (redemptionCount === 0 && members[0] && rewards[0] && rewards[1]) {
    await prisma.redemption.create({ data: { memberId: members[0].id, rewardId: rewards[0].id, pointsUsed: 100, branchId: branches[0].id } });
    await prisma.redemption.create({ data: { memberId: members[0].id, rewardId: rewards[1].id, pointsUsed: 150, branchId: branches[1].id } });
  }
  if (members[1] && rewards[0] && (await prisma.redemption.count({ where: { memberId: members[1].id } })) === 0) {
    await prisma.redemption.create({ data: { memberId: members[1].id, rewardId: rewards[0].id, pointsUsed: 100, branchId: branches[0].id } });
  }
  if (members[2] && rewards[2] && (await prisma.redemption.count({ where: { memberId: members[2].id } })) === 0) {
    await prisma.redemption.create({ data: { memberId: members[2].id, rewardId: rewards[2].id, pointsUsed: 500, branchId: branches[0].id } });
  }

  // ----- Banners (only if none) -----
  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    await prisma.banner.createMany({
      data: [
        { title: 'Welcome Bonus', imageUrl: '/banners/welcome.png', linkUrl: '/campaigns/welcome', sortOrder: 0, active: true },
        { title: 'Double Points', imageUrl: '/banners/double.png', linkUrl: '/campaigns/double', sortOrder: 1, active: true },
      ],
    });
  }

  // ----- Notification logs (add a few for demo) -----
  const notifCount = await prisma.notificationLog.count();
  if (notifCount === 0 && members[0]) {
    await prisma.notificationLog.create({ data: { memberId: members[0].id, channel: 'LINE', type: 'POINTS', payload: JSON.stringify({ message: 'You earned 100 points!', points: 100 }), status: 'SENT' } });
    await prisma.notificationLog.create({ data: { memberId: members[0].id, channel: 'LINE', type: 'PROMO', payload: JSON.stringify({ title: 'Double Points Week' }), status: 'SENT' } });
    await prisma.notificationLog.create({ data: { memberId: null, channel: 'LINE', type: 'BROADCAST', payload: JSON.stringify({ message: 'New rewards available this month!' }), status: 'SENT' } });
  }

  console.log('Seed OK.');
  console.log('Admin: admin@loyalty.local / admin123');
  console.log('API key user: api-key@loyalty.local (use POST /api/auth/token with X-API-Key when API_KEY is set in .env)');
  console.log('Demo: 6 members (DEMO001–DEMO006), 4 branches, 5 rewards, 3 campaigns, redemptions & notifications.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
