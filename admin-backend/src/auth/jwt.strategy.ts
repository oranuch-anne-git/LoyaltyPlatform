import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET') || 'default-secret-change-me',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });
    if (!admin || !admin.active) throw new UnauthorizedException();
    return { id: admin.id, email: admin.email, role: admin.role.name, permissions: JSON.parse(admin.role.permissions || '[]') };
  }
}
