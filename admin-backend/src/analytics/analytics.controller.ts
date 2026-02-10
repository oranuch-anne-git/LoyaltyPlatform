import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  getDashboard() {
    return this.analytics.getDashboard();
  }

  @Get('campaigns')
  @UseGuards(AuthGuard('jwt'))
  getCampaignPerformance() {
    return this.analytics.getCampaignPerformance();
  }

  @Get('audit-logs')
  @UseGuards(AuthGuard('jwt'))
  getAuditLogs(@Query('limit') limit?: string) {
    return this.analytics.getAuditLogs(limit ? parseInt(limit, 10) : 100);
  }
}
