import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /** Health check – no auth. Open in browser or curl to verify service is up (e.g. wake Render free instance). */
  @Get()
  root() {
    return { service: 'customer-backend', ok: true };
  }

  @Get('health')
  health() {
    return { service: 'customer-backend', ok: true };
  }
}
