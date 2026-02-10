import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EarnPointsDto, RedeemPointsDto, AdjustPointsDto } from './dto';

@Injectable()
export class PointsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async getBalance(memberId: string): Promise<number> {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');
    return member.pointBalance;
  }

  async earn(dto: EarnPointsDto, adminId?: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: dto.memberId },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (dto.points <= 0) throw new BadRequestException('Points must be positive');

    const newBalance = member.pointBalance + dto.points;
    await this.prisma.$transaction([
      this.prisma.member.update({
        where: { id: dto.memberId },
        data: { pointBalance: newBalance },
      }),
      this.prisma.pointLedger.create({
        data: {
          memberId: dto.memberId,
          balance: newBalance,
          change: dto.points,
          type: dto.campaignId ? 'CAMPAIGN' : 'EARN',
          referenceId: dto.campaignId || dto.referenceId,
          expiresAt: dto.expiresAt,
        },
      }),
      this.prisma.pointTransaction.create({
        data: {
          memberId: dto.memberId,
          amount: dto.points,
          type: dto.campaignId ? 'CAMPAIGN' : 'PURCHASE',
          referenceId: dto.referenceId,
          branchId: dto.branchId,
          metadata: dto.metadata,
        },
      }),
    ]);
    if (adminId)
      await this.audit.log({
        adminId,
        action: 'POINT_ADJUST',
        resource: 'POINTS',
        resourceId: dto.memberId,
        details: JSON.stringify({ earn: dto.points, reason: dto.metadata }),
      });
    return { balance: newBalance, earned: dto.points };
  }

  async redeem(dto: RedeemPointsDto) {
    const member = await this.prisma.member.findFirst({
      where: { id: dto.memberId },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (dto.points <= 0) throw new BadRequestException('Points must be positive');
    if (member.pointBalance < dto.points) throw new BadRequestException('Insufficient points');

    const newBalance = member.pointBalance - dto.points;
    await this.prisma.$transaction([
      this.prisma.member.update({
        where: { id: dto.memberId },
        data: { pointBalance: newBalance },
      }),
      this.prisma.pointLedger.create({
        data: {
          memberId: dto.memberId,
          balance: newBalance,
          change: -dto.points,
          type: 'REDEEM',
          referenceId: dto.rewardId || dto.referenceId,
        },
      }),
      this.prisma.pointTransaction.create({
        data: {
          memberId: dto.memberId,
          amount: -dto.points,
          type: 'REDEMPTION',
          referenceId: dto.rewardId || dto.referenceId,
          branchId: dto.branchId,
          metadata: dto.metadata,
        },
      }),
    ]);
    return { balance: newBalance, redeemed: dto.points };
  }

  async adjust(dto: AdjustPointsDto, adminId: string) {
    const member = await this.prisma.member.findFirst({
      where: { id: dto.memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    const newBalance = member.pointBalance + dto.points; // can be negative for deduction
    if (newBalance < 0) throw new BadRequestException('Resulting balance cannot be negative');

    await this.prisma.$transaction([
      this.prisma.member.update({
        where: { id: dto.memberId },
        data: { pointBalance: newBalance },
      }),
      this.prisma.pointLedger.create({
        data: {
          memberId: dto.memberId,
          balance: newBalance,
          change: dto.points,
          type: 'ADJUST',
          referenceId: dto.reason,
        },
      }),
      this.prisma.pointTransaction.create({
        data: {
          memberId: dto.memberId,
          amount: dto.points,
          type: 'ADJUSTMENT',
          referenceId: dto.reason,
          metadata: dto.reason,
        },
      }),
    ]);
    await this.audit.log({
      adminId,
      action: 'POINT_ADJUST',
      resource: 'POINTS',
      resourceId: dto.memberId,
      details: JSON.stringify({ adjustment: dto.points, reason: dto.reason }),
    });
    return { balance: newBalance };
  }

  async getLedger(memberId: string, limit = 50) {
    return this.prisma.pointLedger.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getTransactions(memberId: string, limit = 50) {
    return this.prisma.pointTransaction.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
