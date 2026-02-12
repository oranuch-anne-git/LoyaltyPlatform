import type { LocationByZipResponse } from '@loyalty/contracts';
import { PrismaService } from '../prisma/prisma.service';
export declare class LocationService {
    private prisma;
    constructor(prisma: PrismaService);
    getProvinces(): Promise<{
        id: string;
        code: string;
        nameTh: string;
        nameEn: string | null;
    }[]>;
    getDistricts(provinceCode: string): Promise<{
        id: string;
        code: string;
        nameTh: string;
        nameEn: string | null;
    }[]>;
    getSubdistricts(districtId: string): Promise<{
        id: string;
        code: string;
        nameTh: string;
        nameEn: string | null;
        zipCode: string | null;
    }[]>;
    getSubdistrictsByDistrictCode(districtCode: string, provinceCode?: string): Promise<{
        id: string;
        code: string;
        nameTh: string;
        nameEn: string | null;
        zipCode: string | null;
    }[]>;
    getByZipCode(zipCode: string): Promise<LocationByZipResponse>;
}
