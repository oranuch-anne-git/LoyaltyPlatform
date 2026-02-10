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
exports.BranchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BranchService = class BranchService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(activeOnly = true) {
        const where = activeOnly ? { active: true } : {};
        return this.prisma.branch.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const branch = await this.prisma.branch.findUnique({ where: { id } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        return branch;
    }
    async create(code, name, address, region) {
        return this.prisma.branch.create({
            data: { code, name, address, region },
        });
    }
};
exports.BranchService = BranchService;
exports.BranchService = BranchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BranchService);
//# sourceMappingURL=branch.service.js.map