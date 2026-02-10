import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto, UpdateMemberDto, UpdateMemberLevelDto } from './dto';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  private generateMemberId() {
    return 'M' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  async create(dto: CreateMemberDto) {
    const memberId = this.generateMemberId();
    return this.prisma.member.create({
      data: {
        memberId,
        lineUserId: dto.lineUserId,
        name: dto.name ?? '',
        surname: dto.surname ?? '',
        nationalType: dto.nationalType ?? 'OTHER',
        citizenId: dto.citizenId,
        passport: dto.passport,
        sex: dto.sex ?? 'M',
        birthdate: dto.birthdate ? new Date(dto.birthdate) : new Date('1970-01-01'),
        mobile: dto.mobile ?? '',
        email: dto.email,
        displayName: dto.displayName,
        channel: dto.channel ?? undefined,
        memberLevelId: dto.memberLevelId ?? undefined,
        consentPDPA: dto.consentPDPA ?? false,
        consentAt: dto.consentPDPA ? new Date() : null,
        addr_addressNo: dto.addr_addressNo,
        addr_building: dto.addr_building,
        addr_road: dto.addr_road,
        addr_soi: dto.addr_soi,
        addr_subdistrict: dto.addr_subdistrict,
        addr_district: dto.addr_district,
        addr_province: dto.addr_province,
        addr_postalCode: dto.addr_postalCode,
      },
    });
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { memberId: { contains: search } },
            { name: { contains: search } },
            { surname: { contains: search } },
            { email: { contains: search } },
            { mobile: { contains: search } },
            { displayName: { contains: search } },
            { citizenId: { contains: search } },
            { passport: { contains: search } },
            { addr_district: { contains: search } },
            { addr_province: { contains: search } },
            { addr_postalCode: { contains: search } },
          ],
        }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { memberLevel: true, pointLedgers: { take: 0 }, redemptions: { take: 0 }, transactions: { take: 0 } },
      }),
      this.prisma.member.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        memberLevel: true,
        pointLedgers: { orderBy: { createdAt: 'desc' }, take: 50 },
        redemptions: { include: { reward: true }, orderBy: { createdAt: 'desc' }, take: 20 },
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  /** Member_GetInfo: full member info (profile, address, point ledger, redemptions, transactions) */
  async getInfo(id: string) {
    return this.findOne(id);
  }

  async findByMemberId(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { memberId },
      include: { memberLevel: true, redemptions: { include: { reward: true }, take: 10 }, transactions: { take: 20 } },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async update(id: string, dto: UpdateMemberDto) {
    await this.findOne(id);
    return this.prisma.member.update({
      where: { id },
      data: {
        name: dto.name,
        surname: dto.surname,
        nationalType: dto.nationalType,
        citizenId: dto.citizenId,
        passport: dto.passport,
        sex: dto.sex,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
        mobile: dto.mobile,
        email: dto.email,
        displayName: dto.displayName,
        addr_addressNo: dto.addr_addressNo,
        addr_building: dto.addr_building,
        addr_road: dto.addr_road,
        addr_soi: dto.addr_soi,
        addr_subdistrict: dto.addr_subdistrict,
        addr_district: dto.addr_district,
        addr_province: dto.addr_province,
        addr_postalCode: dto.addr_postalCode,
        memberLevelId: dto.memberLevelId ?? undefined,
        consentPDPA: dto.consentPDPA,
        active: dto.active,
      },
    });
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
        privilegeDetail: dto.privilegeDetail,
      },
    });
  }
}
