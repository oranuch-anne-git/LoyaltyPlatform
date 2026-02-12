import { LocationService } from './location.service';
export declare class LocationController {
    private location;
    constructor(location: LocationService);
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
    getSubdistricts(districtId: string, districtCode: string, provinceCode: string): Promise<{
        id: string;
        code: string;
        nameTh: string;
        nameEn: string | null;
        zipCode: string | null;
    }[]>;
    getByZipCode(zipCode: string): Promise<import("@loyalty/contracts").LocationByZipResponse>;
}
