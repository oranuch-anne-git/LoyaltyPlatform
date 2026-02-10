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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CampaignsService = class CampaignsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
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
    async findOne(id) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return campaign;
    }
    async update(id, dto) {
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
    async createBanner(campaignId, title, imageUrl, linkUrl, sortOrder) {
        return this.prisma.banner.create({
            data: { campaignId, title, imageUrl, linkUrl, sortOrder: sortOrder ?? 0 },
        });
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map