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
exports.LocationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LocationService = class LocationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProvinces() {
        return this.prisma.province.findMany({
            orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
            select: { id: true, code: true, nameTh: true, nameEn: true },
        });
    }
    async getDistricts(provinceCode) {
        const province = await this.prisma.province.findUnique({
            where: { code: provinceCode },
            select: { id: true },
        });
        if (!province)
            return [];
        return this.prisma.district.findMany({
            where: { provinceId: province.id },
            orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
            select: { id: true, code: true, nameTh: true, nameEn: true },
        });
    }
    async getSubdistricts(districtId) {
        return this.prisma.subdistrict.findMany({
            where: { districtId },
            orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
            select: { id: true, code: true, nameTh: true, nameEn: true, zipCode: true },
        });
    }
    async getByZipCode(zipCode) {
        const raw = String(zipCode || '').trim();
        if (!raw || !/^\d+$/.test(raw))
            return { provinces: [], districts: [], subdistricts: [] };
        const zip = raw.length <= 5 ? raw.padStart(5, '0') : raw;
        const subdistricts = await this.prisma.subdistrict.findMany({
            where: { zipCode: zip },
            orderBy: [{ sortOrder: 'asc' }, { nameTh: 'asc' }],
            select: {
                id: true,
                code: true,
                nameTh: true,
                nameEn: true,
                zipCode: true,
                district: {
                    select: {
                        id: true,
                        code: true,
                        nameTh: true,
                        nameEn: true,
                        province: {
                            select: { id: true, code: true, nameTh: true, nameEn: true },
                        },
                    },
                },
            },
        });
        const provinceMap = new Map();
        const districtMap = new Map();
        for (const s of subdistricts) {
            const d = s.district;
            const p = d.province;
            provinceMap.set(p.id, { id: p.id, code: p.code, nameTh: p.nameTh, nameEn: p.nameEn });
            districtMap.set(d.id, { id: d.id, code: d.code, nameTh: d.nameTh, nameEn: d.nameEn });
        }
        return {
            provinces: Array.from(provinceMap.values()),
            districts: Array.from(districtMap.values()),
            subdistricts: subdistricts.map((s) => ({
                id: s.id,
                code: s.code,
                nameTh: s.nameTh,
                nameEn: s.nameEn,
                zipCode: s.zipCode,
            })),
        };
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationService);
//# sourceMappingURL=location.service.js.map