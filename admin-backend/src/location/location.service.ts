import type { LocationByZipResponse } from '@loyalty/contracts';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async getProvinces() {
    return this.prisma.province.findMany({
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      select: { id: true, code: true, nameTh: true, nameEn: true },
    });
  }

  async getDistricts(provinceCode: string) {
    const province = await this.prisma.province.findUnique({
      where: { code: provinceCode },
      select: { id: true },
    });
    if (!province) return [];
    return this.prisma.district.findMany({
      where: { provinceId: province.id },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      select: { id: true, code: true, nameTh: true, nameEn: true },
    });
  }

  async getSubdistricts(districtId: string) {
    return this.prisma.subdistrict.findMany({
      where: { districtId },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      select: { id: true, code: true, nameTh: true, nameEn: true, zipCode: true },
    });
  }

  /** Get subdistricts by district code. If provinceCode is given, district is scoped to that province; else the first district with that code is used (district codes may be unique nationally in Thailand). */
  async getSubdistrictsByDistrictCode(districtCode: string, provinceCode?: string) {
    let district: { id: string } | null;
    if (provinceCode?.trim()) {
      const province = await this.prisma.province.findUnique({
        where: { code: provinceCode.trim() },
        select: { id: true },
      });
      if (!province) return [];
      district = await this.prisma.district.findUnique({
        where: { provinceId_code: { provinceId: province.id, code: districtCode.trim() } },
        select: { id: true },
      });
    } else {
      district = await this.prisma.district.findFirst({
        where: { code: districtCode.trim() },
        select: { id: true },
      });
    }
    if (!district) return [];
    return this.prisma.subdistrict.findMany({
      where: { districtId: district.id },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      select: { id: true, code: true, nameTh: true, nameEn: true, zipCode: true },
    });
  }

  /** Get provinces, districts, and subdistricts that have the given zip code (for zipcode-first dropdown filtering). */
  async getByZipCode(zipCode: string): Promise<LocationByZipResponse> {
    const raw = String(zipCode || '').trim();
    if (!raw || !/^\d+$/.test(raw)) return { provinces: [], districts: [], subdistricts: [] };
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
    const provinceMap = new Map<string, { id: string; code: string; nameTh: string; nameEn: string | null }>();
    const districtMap = new Map<string, { id: string; code: string; nameTh: string; nameEn: string | null }>();
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
}
