import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { AuditService } from '../audit/audit.service';

const API_KEY_USER_EMAIL = 'api-key@loyalty.local';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private audit: AuditService,
    private config: ConfigService,
  ) {}

  async validateAdmin(email: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email, active: true },
      include: { role: true },
    });
    if (!admin) return null;
    const hash = this.hashPassword(password, admin.email);
    if (admin.passwordHash !== hash) return null;
    return admin;
  }

  async login(email: string, password: string, ip?: string) {
    const admin = await this.validateAdmin(email, password);
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: admin.id, email: admin.email, role: admin.role.name };
    const access_token = this.jwt.sign(payload);
    await this.audit.log({
      adminId: admin.id,
      action: 'LOGIN',
      resource: 'AUTH',
      details: JSON.stringify({ email: admin.email }),
      ip,
    });
    return {
      access_token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role.name,
      },
    };
  }

  /** Get JWT using API key. Configure API_KEY or API_KEYS (comma-separated) in env. */
  async loginWithApiKey(apiKey: string, ip?: string) {
    const configuredKeys = this.config.get<string>('API_KEY') || this.config.get<string>('API_KEYS') || '';
    const validKeys = configuredKeys.split(',').map((k) => k.trim()).filter(Boolean);
    if (validKeys.length === 0 || !apiKey || !validKeys.includes(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: API_KEY_USER_EMAIL, active: true },
      include: { role: true },
    });
    if (!admin) throw new UnauthorizedException('API key user not configured. Run seed.');
    const payload = { sub: admin.id, email: admin.email, role: admin.role.name };
    const access_token = this.jwt.sign(payload);
    await this.audit.log({
      adminId: admin.id,
      action: 'LOGIN_API_KEY',
      resource: 'AUTH',
      details: JSON.stringify({ method: 'api_key' }),
      ip,
    });
    return {
      access_token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role.name,
      },
    };
  }

  hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  }

  async createAdminUser(email: string, password: string, name: string, roleName: string) {
    const role = await this.prisma.role.findFirst({ where: { name: roleName } });
    if (!role) throw new Error('Role not found');
    const passwordHash = this.hashPassword(password, email);
    return this.prisma.adminUser.create({
      data: { email, passwordHash, name, roleId: role.id },
      include: { role: true },
    });
  }
}
