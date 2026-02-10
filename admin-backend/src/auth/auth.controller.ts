import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: { ip?: string }) {
    return this.auth.login(dto.email, dto.password, req.ip);
  }

  /** Get JWT with API key. Send X-API-Key header or body { "apiKey": "..." }. Returns same shape as login. */
  @Post('token')
  async token(
    @Headers('x-api-key') apiKeyHeader: string | undefined,
    @Body() body: { apiKey?: string },
    @Req() req: { ip?: string },
  ) {
    const apiKey = apiKeyHeader || body?.apiKey;
    return this.auth.loginWithApiKey(apiKey || '', req.ip);
  }

  @Post('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: { user: { id: string; email: string; role: string } }) {
    return { user: req.user };
  }
}
