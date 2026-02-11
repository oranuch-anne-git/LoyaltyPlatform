import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  /**
   * Get JWT with API key. Send X-API-Key header or body { "apiKey": "..." }.
   * Proxies to Admin Backend. Returns { access_token }.
   */
  @Post('token')
  async token(
    @Headers('x-api-key') apiKeyHeader: string | undefined,
    @Body() body: { apiKey?: string },
  ) {
    return this.auth.token(apiKeyHeader, body?.apiKey);
  }
}
