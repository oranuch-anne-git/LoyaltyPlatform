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
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const points_service_1 = require("../points/points.service");
let RewardsService = class RewardsService {
    constructor(prisma, points) {
        this.prisma = prisma;
        this.points = points;
    }
    async create(dto) {
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
    async findAll(category, activeOnly = true) {
        const where = {};
        if (category)
            where.category = category;
        if (activeOnly)
            where.active = true;
        return this.prisma.reward.findMany({
            where,
            orderBy: [{ category: 'asc' }, { pointCost: 'asc' }],
            include: { redemptions: { take: 0 } },
        });
    }
    async findOne(id) {
        const reward = await this.prisma.reward.findUnique({
            where: { id },
            include: { redemptions: { take: 20, orderBy: { createdAt: 'desc' } } },
        });
        if (!reward)
            throw new common_1.NotFoundException('Reward not found');
        return reward;
    }
    async update(id, dto) {
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
    async redeem(dto) {
        const reward = await this.prisma.reward.findUnique({
            where: { id: dto.rewardId },
        });
        if (!reward)
            throw new common_1.NotFoundException('Reward not found');
        if (!reward.active)
            throw new common_1.BadRequestException('Reward is not active');
        const now = new Date();
        if (reward.validFrom && now < reward.validFrom)
            throw new common_1.BadRequestException('Reward not yet valid');
        if (reward.validTo && now > reward.validTo)
            throw new common_1.BadRequestException('Reward expired');
        if (reward.quantity >= 0) {
            const redeemed = await this.prisma.redemption.count({ where: { rewardId: reward.id } });
            if (redeemed >= reward.quantity)
                throw new common_1.BadRequestException('Reward out of stock');
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
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        points_service_1.PointsService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map