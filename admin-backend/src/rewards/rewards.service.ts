import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PointsService } from '../points/points.service';
import { CreateRewardDto, UpdateRewardDto, RedeemRewardDto } from './dto';

@Injectable()
export class RewardsService {
  constructor(
    private prisma: PrismaService,
    private points: PointsService,
  ) {}

  async create(dto: CreateRewardDto) {
    return this.prisma.reward.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        partnerId: dto.partnerId,
        pointCost: dto.pointCost,
        quantity: dto.quantity ?? -1,
        validFrom: dto.validFrom,
        validTo: dto.validTo,
      },
    });
  }

  async findAll(category?: string, activeOnly = true) {
    const where: { category?: string; active?: boolean } = {};
    if (category) where.category = category;
    if (activeOnly) where.active = true;
    return this.prisma.reward.findMany({
      where,
      orderBy: [{ category: 'asc' }, { pointCost: 'asc' }],
      include: { redemptions: { take: 0 } },
    });
  }

  async findOne(id: string) {
    const reward = await this.prisma.reward.findUnique({
      where: { id },
      include: { redemptions: { take: 20, orderBy: { createdAt: 'desc' } } },
    });
    if (!reward) throw new NotFoundException('Reward not found');
    return reward;
  }

  async update(id: string, dto: UpdateRewardDto) {
    await this.findOne(id);
    return this.prisma.reward.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        pointCost: dto.pointCost,
        quantity: dto.quantity,
        validFrom: dto.validFrom,
        validTo: dto.validTo,
        active: dto.active,
      },
    });
  }

  async redeem(dto: RedeemRewardDto) {
    const reward = await this.prisma.reward.findUnique({
      where: { id: dto.rewardId },
    });
    if (!reward) throw new NotFoundException('Reward not found');
    if (!reward.active) throw new BadRequestException('Reward is not active');
    const now = new Date();
    if (reward.validFrom && now < reward.validFrom) throw new BadRequestException('Reward not yet valid');
    if (reward.validTo && now > reward.validTo) throw new BadRequestException('Reward expired');
    if (reward.quantity >= 0) {
      const redeemed = await this.prisma.redemption.count({ where: { rewardId: reward.id } });
      if (redeemed >= reward.quantity) throw new BadRequestException('Reward out of stock');
    }

    await this.points.redeem({
      memberId: dto.memberId,
      points: reward.pointCost,
      rewardId: reward.id,
      branchId: dto.branchId,
    });

    return this.prisma.redemption.create({
      data: {
        memberId: dto.memberId,
        rewardId: reward.id,
        pointsUsed: reward.pointCost,
        branchId: dto.branchId,
      },
      include: { reward: true },
    });
  }
}
