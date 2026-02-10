import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly = true) {
    const where = activeOnly ? { active: true } : {};
    return this.prisma.branch.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async create(code: string, name: string, address?: string, region?: string) {
    return this.prisma.branch.create({
      data: { code, name, address, region },
    });
  }
}
