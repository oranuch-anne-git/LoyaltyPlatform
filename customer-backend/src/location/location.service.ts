import type { LocationByZipResponse, LocationItem, SubdistrictItem } from '@loyalty/contracts';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class LocationService {
  private readonly platformClient: AxiosInstance;
  private readonly platformUrl: string;

  constructor(private config: ConfigService) {
    this.platformUrl = this.config.get<string>('PLATFORM_API_URL', 'http://localhost:3000');
    this.platformClient = axios.create({
      baseURL: this.platformUrl,
      timeout: 70000, // allow Admin Backend on Render free tier to cold-start (~50–60s)
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private getAuthHeader(authHeader?: string): string | undefined {
    if (authHeader?.startsWith('Bearer ')) return authHeader;
    const serviceToken = this.config.get<string>('PLATFORM_SERVICE_TOKEN');
    if (serviceToken) return `Bearer ${serviceToken}`;
    return authHeader;
  }

  private handleError(err: unknown): never {
    const status = axios.isAxiosError(err) && err.response?.status ? err.response.status : HttpStatus.BAD_GATEWAY;
    const message = axios.isAxiosError(err) && err.response?.data?.message ? err.response.data.message : 'Platform request failed';
    throw new HttpException(message, status);
  }

  private unwrapPlatformData<T>(body: T | { data?: T }): T {
    if (body != null && typeof body === 'object' && 'data' in body && (body as { data?: T }).data !== undefined) {
      return (body as { data: T }).data;
    }
    return body as T;
  }

  private async getByZipCode(zipCode: string, authHeader?: string): Promise<LocationByZipResponse> {
    const zip = String(zipCode || '').trim();
    if (!zip) return { provinces: [], districts: [], subdistricts: [] };
    try {
      const { data } = await this.platformClient.get<LocationByZipResponse | { data?: LocationByZipResponse }>(`/api/by-zip`, {
        params: { zipCode: zip },
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      const out = this.unwrapPlatformData<LocationByZipResponse>(data);
      return out ?? { provinces: [], districts: [], subdistricts: [] };
    } catch (err) {
      this.handleError(err);
    }
  }

  /** List provinces that have subdistricts with the given zip code. */
  async getProvincesByZipCode(zipCode: string, authHeader?: string): Promise<LocationItem[]> {
    const data = await this.getByZipCode(zipCode, authHeader);
    return data.provinces ?? [];
  }

  /** List districts that have subdistricts with the given zip code. */
  async getDistrictsByZipCode(zipCode: string, authHeader?: string): Promise<LocationItem[]> {
    const data = await this.getByZipCode(zipCode, authHeader);
    return data.districts ?? [];
  }

  /** List subdistricts with the given zip code. */
  async getSubdistrictsByZipCode(zipCode: string, authHeader?: string): Promise<SubdistrictItem[]> {
    const data = await this.getByZipCode(zipCode, authHeader);
    return data.subdistricts ?? [];
  }

  /** List subdistricts for the given district (by district code; optional provinceCode to scope). */
  async getSubdistrictsByDistrictCode(districtCode: string, provinceCode: string | undefined, authHeader?: string): Promise<SubdistrictItem[]> {
    if (!districtCode?.trim()) return [];
    try {
      const params: { districtCode: string; provinceCode?: string } = { districtCode: districtCode.trim() };
      if (provinceCode?.trim()) params.provinceCode = provinceCode.trim();
      const { data } = await this.platformClient.get<SubdistrictItem[] | { data?: SubdistrictItem[] }>('/api/subdistricts', {
        params,
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      const list = this.unwrapPlatformData<SubdistrictItem[]>(data);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      this.handleError(err);
    }
  }
}
