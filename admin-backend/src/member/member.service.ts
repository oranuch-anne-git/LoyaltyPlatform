import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto, UpdateMemberDto, UpdateMemberLevelDto } from './dto';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  private generateMemberId() {
    return 'M' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  /** Attach memberLevel (from levelCode lookup) to member for API response. */
  private async attachMemberLevel<T extends { levelCode: string | null }>(member: T): Promise<T & { memberLevel: { id: string; code: string; name: string } | null }> {
    if (!member.levelCode) return { ...member, memberLevel: null };
    const level = await this.prisma.memberLevel.findUnique({ where: { code: member.levelCode } });
    return { ...member, memberLevel: level ? { id: level.id, code: level.code, name: level.name } : null };
  }

  async create(dto: CreateMemberDto) {
    if (dto.levelCode) {
      const level = await this.prisma.memberLevel.findUnique({ where: { code: dto.levelCode } });
      if (!level) throw new NotFoundException(`Member level not found: ${dto.levelCode}`);
    }
    const memberId = this.generateMemberId();
    const member = await this.prisma.member.create({
      data: {
        memberId,
        crmId: dto.crmId,
        lineUserId: dto.lineUserId,
        firstName: dto.firstName ?? '',
        lastName: dto.lastName ?? '',
        nationalType: dto.nationalType ?? 'OTHER',
        citizenId: dto.citizenId,
        passport: dto.passport,
        gender: dto.gender ?? '1',
        birthdate: dto.birthdate ? new Date(dto.birthdate) : null,
        mobile: dto.mobile ?? '',
        email: dto.email,
        channel: dto.channel ?? undefined,
        levelCode: dto.levelCode ?? undefined,
        consentPDPA: dto.consentPDPA ?? false,
        consentAt: dto.consentPDPA ? new Date() : null,
        addr_addressNo: dto.addr_addressNo,
        addr_building: dto.addr_building,
        addr_road: dto.addr_road,
        addr_soi: dto.addr_soi,
        addr_moo: dto.addr_moo,
        addr_subdistrict: dto.addr_subdistrict,
        addr_subdistrictCode: dto.addr_subdistrictCode,
        addr_district: dto.addr_district,
        addr_districtCode: dto.addr_districtCode,
        addr_province: dto.addr_province,
        addr_provinceCode: dto.addr_provinceCode,
        addr_zipCode: dto.addr_zipCode,
        addr_country: dto.addr_country,
      },
    });
    return this.attachMemberLevel(member);
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { memberId: { contains: search } },
            { crmId: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { mobile: { contains: search } },
            { citizenId: { contains: search } },
            { passport: { contains: search } },
            { addr_district: { contains: search } },
            { addr_province: { contains: search } },
            { addr_zipCode: { contains: search } },
          ],
        }
      : {};
    const [rows, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { pointLedgers: { take: 0 }, redemptions: { take: 0 }, transactions: { take: 0 } },
      }),
      this.prisma.member.count({ where }),
    ]);
    const items = await Promise.all(rows.map((m) => this.attachMemberLevel(m)));
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        pointLedgers: { orderBy: { createdAt: 'desc' }, take: 50 },
        redemptions: { include: { reward: true }, orderBy: { createdAt: 'desc' }, take: 20 },
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!member) throw new NotFoundException('Member not found');
    return this.attachMemberLevel(member);
  }

  /** Member_GetInfo: full member info (profile, address, point ledger, redemptions, transactions) */
  async getInfo(id: string) {
    return this.findOne(id);
  }

  /** Member_GetInfo by memberId (profile + address only; no pointLedgers, redemptions, transactions). */
  async getInfoByMemberId(memberId: string) {
    const member = await this.prisma.member.findUnique({ where: { memberId } });
    if (!member) throw new NotFoundException('Member not found');
    return this.attachMemberLevel(member);
  }

  /** Update member by memberId. */
  async updateByMemberId(memberId: string, dto: UpdateMemberDto) {
    const m = await this.prisma.member.findUnique({ where: { memberId } });
    if (!m) throw new NotFoundException('Member not found');
    return this.update(m.id, dto);
  }

  async findByMemberId(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { memberId },
      include: { redemptions: { include: { reward: true }, take: 10 }, transactions: { take: 20 } },
    });
    if (!member) throw new NotFoundException('Member not found');
    return this.attachMemberLevel(member);
  }

  async update(id: string, dto: UpdateMemberDto) {
    await this.prisma.member.findUniqueOrThrow({ where: { id } });
    if (dto.levelCode !== undefined) {
      if (dto.levelCode) {
        const level = await this.prisma.memberLevel.findUnique({ where: { code: dto.levelCode } });
        if (!level) throw new NotFoundException(`Member level not found: ${dto.levelCode}`);
      }
    }
    const member = await this.prisma.member.update({
      where: { id },
      data: {
        crmId: dto.crmId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        nationalType: dto.nationalType,
        citizenId: dto.citizenId,
        passport: dto.passport,
        gender: dto.gender,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : dto.birthdate === null || dto.birthdate === '' ? null : undefined,
        mobile: dto.mobile,
        email: dto.email,
        addr_addressNo: dto.addr_addressNo,
        addr_building: dto.addr_building,
        addr_road: dto.addr_road,
        addr_soi: dto.addr_soi,
        addr_moo: dto.addr_moo,
        addr_subdistrict: dto.addr_subdistrict,
        addr_subdistrictCode: dto.addr_subdistrictCode,
        addr_district: dto.addr_district,
        addr_districtCode: dto.addr_districtCode,
        addr_province: dto.addr_province,
        addr_provinceCode: dto.addr_provinceCode,
        addr_zipCode: dto.addr_zipCode,
        addr_country: dto.addr_country,
        levelCode: dto.levelCode ?? undefined,
        consentPDPA: dto.consentPDPA,
        active: dto.active,
      },
    });
    return this.attachMemberLevel(member);
  }

  /** Company_GetMemberLevel: list member levels ordered by sortOrder (id, code, name, benefits, etc.) */
  async getLevels() {
    return this.prisma.memberLevel.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async updateLevel(id: string, dto: UpdateMemberLevelDto) {
    await this.prisma.memberLevel.findUniqueOrThrow({ where: { id } });
    return this.prisma.memberLevel.update({
      where: { id },
      data: {
        name: dto.name,
        sortOrder: dto.sortOrder,
        privilegeTh: dto.privilegeTh,
        privilegeEn: dto.privilegeEn,
      },
    });
  }
}
