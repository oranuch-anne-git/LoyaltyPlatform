import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        conditions: dto.conditions,
        config: dto.config,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
      },
    });
  }

  async findAll(activeOnly = true) {
    const where = activeOnly ? { active: true } : {};
    return this.prisma.campaign.findMany({
      where,
      orderBy: { validFrom: 'desc' },
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto) {
    await this.findOne(id);
    return this.prisma.campaign.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        conditions: dto.conditions,
        config: dto.config,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validTo: dto.validTo ? new Date(dto.validTo) : undefined,
        active: dto.active,
      },
    });
  }

  async getBanners() {
    return this.prisma.banner.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createBanner(campaignId: string | null, title: string, imageUrl?: string, linkUrl?: string, sortOrder?: number) {
    return this.prisma.banner.create({
      data: { campaignId, title, imageUrl, linkUrl, sortOrder: sortOrder ?? 0 },
    });
  }
}
