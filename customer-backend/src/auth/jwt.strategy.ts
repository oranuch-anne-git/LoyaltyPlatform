import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (
        _req: Express.Request,
        _rawJwtToken: string,
        done: (err: Error | null, secret?: string) => void,
      ) => {
        const secret = this.config.get<string>('JWT_SECRET') || 'default-secret-change-me';
        done(null, secret);
      },
      algorithms: ['HS256'],
    } as StrategyOptions);
  }

  validate(payload: { sub: string; email?: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
