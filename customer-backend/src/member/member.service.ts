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

  /**
   * Map admin backend member (flat) to get-info payload (single envelope added by ResponseTransformInterceptor).
   * Returns the data object only: { id, memberId, ..., user: { profile, address } }.
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
    return {
      id: member.id,
      memberId: member.memberId,
      crmId: member.crmId ?? null,
      lineUserId: member.lineUserId ?? null,
      active: member.active ?? true,
      channel: member.channel ?? null,
      pointBalance: member.pointBalance ?? 0,
      user,
    };
  }

  /**
   * Member_GetInfo: member profile by memberId.
   * Proxies to Admin Backend GET /api/members/get-info/by-member-id/:memberId.
   * Returns payload only; ResponseTransformInterceptor adds single { status, data } envelope.
   */
  async getInfo(memberId: string, authHeader?: string) {
    try {
      const { data } = await this.platformClient.get(`/api/members/get-info/by-member-id/${encodeURIComponent(memberId)}`, {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      const body = data as Record<string, unknown> | undefined;
      let member: Record<string, unknown> | undefined =
        body && typeof body === 'object' && 'data' in body && body.data != null ? (body.data as Record<string, unknown>) : (body as Record<string, unknown>);
      // Unwrap one more level if platform returned { status, data: { status, data: member } }
      if (member && typeof member === 'object' && 'data' in member && member.data != null && typeof member.data === 'object') {
        member = member.data as Record<string, unknown>;
      }
      // Return payload only so interceptor produces one status envelope
      return this.mapToGetProfileResponse((member ?? {}) as Record<string, unknown>);
    } catch (err) {
      this.handleError(err);
    }
  }

  /** Strip id, createdAt, updatedAt from list items (customer API does not expose these). */
  private stripIdAndTimestamps<T extends Record<string, unknown>>(items: T[]): Omit<T, 'id' | 'createdAt' | 'updatedAt'>[] {
    return items.map((item) => {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = item;
      return rest as Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
    });
  }

  /**
   * Company_GetMemberLevel: list member levels (Yellow, Silver, Black) with benefit fields.
   * Proxies to Admin Backend GET /api/members/levels. Does not return id, createdAt, updatedAt.
   */
  async getLevels(authHeader?: string) {
    try {
      const { data } = await this.platformClient.get('/api/members/levels', {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      const raw = (data != null && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data))
        ? (data as { data: Record<string, unknown>[] }).data
        : Array.isArray(data) ? data : [];
      return this.stripIdAndTimestamps(raw as Record<string, unknown>[]);
    } catch (err) {
      this.handleError(err);
    }
  }

  /** Fields allowed for Create and Update (same shape). levelCode is not accepted. */
  private stripLevelCodeAndForward(body: Record<string, unknown>): Record<string, unknown> {
    const { levelCode: _removed, ...rest } = body;
    return rest;
  }

  /**
   * Create member. Proxies to Admin Backend POST /api/members.
   * Body: same fields as Update (firstName, lastName, nationalType, citizenId, passport, gender, birthdate, mobile, email, addr_*, etc.). levelCode is not accepted.
   */
  async create(body: Record<string, unknown>, authHeader?: string) {
    try {
      const payload = this.stripLevelCodeAndForward(body);
      const { data } = await this.platformClient.post('/api/members', payload, {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Update member profile and/or address by memberId. Proxies to Admin Backend PATCH /api/members/by-member-id/:memberId.
   * Body: any of firstName, lastName, nationalType, citizenId, passport, gender, birthdate, mobile, email, addr_*, etc. levelCode is not accepted.
   */
  async update(memberId: string, body: Record<string, unknown>, authHeader?: string) {
    try {
      const payload = this.stripLevelCodeAndForward(body);
      const { data } = await this.platformClient.patch(`/api/members/by-member-id/${encodeURIComponent(memberId)}`, payload, {
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
