"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MemberService = class MemberService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateMemberId() {
        return 'M' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
    }
    async create(dto) {
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
    async findAll(page = 1, limit = 20, search) {
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
    async findOne(id) {
        const member = await this.prisma.member.findUnique({
            where: { id },
            include: {
                memberLevel: true,
                pointLedgers: { orderBy: { createdAt: 'desc' }, take: 50 },
                redemptions: { include: { reward: true }, orderBy: { createdAt: 'desc' }, take: 20 },
                transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
            },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        return member;
    }
    async getInfo(id) {
        return this.findOne(id);
    }
    async findByMemberId(memberId) {
        const member = await this.prisma.member.findUnique({
            where: { memberId },
            include: { memberLevel: true, redemptions: { include: { reward: true }, take: 10 }, transactions: { take: 20 } },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        return member;
    }
    async update(id, dto) {
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
    async getLevels() {
        return this.prisma.memberLevel.findMany({ orderBy: { sortOrder: 'asc' } });
    }
    async updateLevel(id, dto) {
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
};
exports.MemberService = MemberService;
exports.MemberService = MemberService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MemberService);
//# sourceMappingURL=member.service.js.map