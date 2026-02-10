import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [totalMembers, activeCampaigns, totalRedemptions, totalPointsEarned] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.campaign.count({ where: { active: true } }),
      this.prisma.redemption.count(),
      this.prisma.pointTransaction.aggregate({
        where: { amount: { gt: 0 } },
        _sum: { amount: true },
      }),
    ]);
    const totalPointsRedeemed = await this.prisma.pointTransaction.aggregate({
      where: { amount: { lt: 0 } },
      _sum: { amount: true },
    });
    return {
      totalMembers,
      activeCampaigns,
      totalRedemptions,
      totalPointsEarned: totalPointsEarned._sum.amount ?? 0,
      totalPointsRedeemed: Math.abs(totalPointsRedeemed._sum.amount ?? 0),
    };
  }

  async getCampaignPerformance() {
    const campaigns = await this.prisma.campaign.findMany({
      where: { active: true },
      orderBy: { validFrom: 'desc' },
      take: 10,
    });
    return campaigns;
  }

  async getAuditLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { adminUser: { select: { email: true, name: true } } },
    });
  }
}
