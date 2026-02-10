import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      name: 'Loyalty Platform API',
      version: '1.0',
      docs: '/api',
      health: 'ok',
    };
  }
}
