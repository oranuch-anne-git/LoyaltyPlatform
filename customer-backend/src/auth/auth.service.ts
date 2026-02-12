import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly platformUrl: string;

  constructor(private config: ConfigService) {
    this.platformUrl = this.config.get<string>('PLATFORM_API_URL', 'http://localhost:3000');
  }

  private handleError(err: unknown): never {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message ?? 'Platform request failed';
        throw new HttpException(message, status);
      }
      const url = this.platformUrl;
const cause = err.code === 'ECONNREFUSED'
        ? `Admin Backend unreachable at ${url}. Is it running? Start admin-backend (e.g. npm run start:dev) and check PLATFORM_API_URL.`
          : err.code === 'ETIMEDOUT' || err.message?.includes('timeout')
          ? `Admin Backend at ${url} did not respond in time. Check: (1) PLATFORM_API_URL on this service is your deployed Admin Backend URL (e.g. https://your-admin.onrender.com). (2) Admin Backend is deployed and Live on Render. (3) Open the Admin Backend URL in a browser to wake it, then retry.`
          : `Platform request failed: ${err.message || err.code || 'unknown'}`;
      throw new HttpException(cause, HttpStatus.BAD_GATEWAY);
    }
    throw new HttpException('Platform request failed', HttpStatus.BAD_GATEWAY);
  }

  /**
   * Get JWT via API key. Proxies to Admin Backend POST /api/auth/token.
   * Accepts X-API-Key header or body { apiKey: "..." }. Returns { access_token }.
   */
  async token(apiKeyHeader: string | undefined, bodyApiKey?: string) {
    const apiKey = apiKeyHeader || bodyApiKey || '';
    try {
      const { data } = await axios.post(
        `${this.platformUrl}/api/auth/token`,
        { apiKey },
        {
          timeout: 70000, // 70s so Admin Backend on Render free tier can cold-start (~50–60s)
          headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
        },
      );
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }
}
