import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class MemberService {
  private readonly platformClient: AxiosInstance;
  private readonly platformUrl: string;

  constructor(private config: ConfigService) {
    this.platformUrl = this.config.get<string>('PLATFORM_API_URL', 'http://localhost:3000');
    this.platformClient = axios.create({
      baseURL: this.platformUrl,
      timeout: 15000,
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

  /**
   * Map admin backend member (flat) to customer API get-profile response structure.
   * Response: { status: { success, message }, data: { id, memberId, ..., user: { profile, address } } }
   */
  private mapToGetProfileResponse(member: Record<string, unknown>) {
    const addressKeys = [
      'addr_addressNo', 'addr_moo', 'addr_building', 'addr_soi', 'addr_road',
      'addr_subdistrict', 'addr_subdistrictCode', 'addr_district', 'addr_districtCode',
      'addr_province', 'addr_provinceCode', 'addr_zipCode', 'addr_country',
    ];
    const address: Record<string, unknown> = {};
    for (const key of addressKeys) {
      address[key] = Object.prototype.hasOwnProperty.call(member, key) ? member[key] : null;
    }
    const user = {
      firstName: member.firstName ?? null,
      lastName: member.lastName ?? null,
      nationalType: member.nationalType ?? null,
      citizenId: member.citizenId ?? null,
      passport: member.passport ?? null,
      gender: member.gender ?? null,
      birthdate: member.birthdate ?? null,
      mobile: member.mobile ?? null,
      email: member.email ?? null,
      address,
    };
    const data = {
      id: member.id,
      memberId: member.memberId,
      crmId: member.crmId ?? null,
      lineUserId: member.lineUserId ?? null,
      levelCode: member.levelCode ?? null,
      active: member.active ?? true,
      channel: member.channel ?? null,
      pointBalance: member.pointBalance ?? 0,
      user,
    };
    return {
      status: { success: true, message: 'success' },
      data,
    };
  }

  /**
   * Member_GetInfo: member profile by memberId.
   * Proxies to Admin Backend GET /api/members/get-info/by-member-id/:memberId
   * and returns { status: { success, message }, data: { id, memberId, ..., user: { profile, address } } }.
   */
  async getInfo(memberId: string, authHeader?: string) {
    try {
      const { data } = await this.platformClient.get(`/api/members/get-info/by-member-id/${encodeURIComponent(memberId)}`, {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      return this.mapToGetProfileResponse(data as Record<string, unknown>);
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Company_GetMemberLevel: list member levels (Yellow, Silver, Black) with benefit fields.
   * Proxies to Admin Backend GET /api/members/levels
   */
  async getLevels(authHeader?: string) {
    try {
      const { data } = await this.platformClient.get('/api/members/levels', {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Create member. Proxies to Admin Backend POST /api/members.
   * Body: profile + optional address (name, surname, nationalType, sex, birthdate, mobile, email, addr_*, etc.)
   */
  async create(body: Record<string, unknown>, authHeader?: string) {
    try {
      const { data } = await this.platformClient.post('/api/members', body, {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Update member profile and/or address by memberId. Proxies to Admin Backend PATCH /api/members/by-member-id/:memberId.
   * Body: any of name, surname, nationalType, citizenId, passport, sex, birthdate, mobile, email, addr_*, etc.
   */
  async update(memberId: string, body: Record<string, unknown>, authHeader?: string) {
    try {
      const { data } = await this.platformClient.patch(`/api/members/by-member-id/${encodeURIComponent(memberId)}`, body, {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Update member address only by memberId. Proxies to Admin Backend PATCH /api/members/by-member-id/:memberId/address.
   */
  async updateAddress(memberId: string, body: Record<string, unknown>, authHeader?: string) {
    const addressFields = [
      'addr_addressNo', 'addr_building', 'addr_road', 'addr_soi', 'addr_moo',
      'addr_subdistrict', 'addr_subdistrictCode', 'addr_district', 'addr_districtCode',
      'addr_province', 'addr_provinceCode', 'addr_zipCode', 'addr_country',
    ];
    const addressBody: Record<string, unknown> = {};
    for (const key of addressFields) {
      if (Object.prototype.hasOwnProperty.call(body, key)) addressBody[key] = body[key];
    }
    try {
      const { data } = await this.platformClient.patch(`/api/members/by-member-id/${encodeURIComponent(memberId)}/address`, addressBody, {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Cancel member by memberId: mark active = false (deactivate). Does not delete the member.
   * Proxies to Admin Backend PATCH /api/members/by-member-id/:memberId/cancel.
   */
  async cancel(memberId: string, authHeader?: string) {
    try {
      const { data } = await this.platformClient.patch(`/api/members/by-member-id/${encodeURIComponent(memberId)}/cancel`, {}, {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }
}
