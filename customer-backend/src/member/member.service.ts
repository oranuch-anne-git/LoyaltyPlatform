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
   * Member_GetInfo: full member info (profile, address, point ledger, redemptions, transactions).
   * Proxies to Admin Backend GET /api/members/get-info/:id
   */
  async getInfo(id: string, authHeader?: string) {
    try {
      const { data } = await this.platformClient.get(`/api/members/get-info/${id}`, {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      return data;
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
   * Update member profile and/or address. Proxies to Admin Backend PATCH /api/members/:id.
   * Body: any of name, surname, nationalType, citizenId, passport, sex, birthdate, mobile, email, addr_*, etc.
   */
  async update(id: string, body: Record<string, unknown>, authHeader?: string) {
    try {
      const { data } = await this.platformClient.patch(`/api/members/${id}`, body, {
        headers: { Authorization: this.getAuthHeader(authHeader) },
      });
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Update member address only. Proxies to Admin Backend PATCH /api/members/:id with addr_* fields.
   */
  async updateAddress(id: string, body: Record<string, unknown>, authHeader?: string) {
    const addressFields = [
      'addr_addressNo', 'addr_building', 'addr_road', 'addr_soi',
      'addr_subdistrict', 'addr_district', 'addr_province', 'addr_postalCode',
    ];
    const addressBody: Record<string, unknown> = {};
    for (const key of addressFields) {
      if (Object.prototype.hasOwnProperty.call(body, key)) addressBody[key] = body[key];
    }
    return this.update(id, addressBody, authHeader);
  }

  /**
   * Cancel member: mark active = false (deactivate). Does not delete the member.
   * Proxies to Admin Backend PATCH /api/members/:id with { active: false }.
   */
  async cancel(id: string, authHeader?: string) {
    return this.update(id, { active: false }, authHeader);
  }
}
