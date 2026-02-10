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
exports.PointsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let PointsService = class PointsService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async getBalance(memberId) {
        const member = await this.prisma.member.findUnique({ where: { id: memberId } });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        return member.pointBalance;
    }
    async earn(dto, adminId) {
        const member = await this.prisma.member.findFirst({
            where: { id: dto.memberId },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        if (dto.points <= 0)
            throw new common_1.BadRequestException('Points must be positive');
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
    async redeem(dto) {
        const member = await this.prisma.member.findFirst({
            where: { id: dto.memberId },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        if (dto.points <= 0)
            throw new common_1.BadRequestException('Points must be positive');
        if (member.pointBalance < dto.points)
            throw new common_1.BadRequestException('Insufficient points');
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
    async adjust(dto, adminId) {
        const member = await this.prisma.member.findFirst({
            where: { id: dto.memberId },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        const newBalance = member.pointBalance + dto.points;
        if (newBalance < 0)
            throw new common_1.BadRequestException('Resulting balance cannot be negative');
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
    async getLedger(memberId, limit = 50) {
        return this.prisma.pointLedger.findMany({
            where: { memberId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getTransactions(memberId, limit = 50) {
        return this.prisma.pointTransaction.findMany({
            where: { memberId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
};
exports.PointsService = PointsService;
exports.PointsService = PointsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], PointsService);
//# sourceMappingURL=points.service.js.map