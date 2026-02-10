import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get('logs')
  @UseGuards(AuthGuard('jwt'))
  getLogs(@Query('memberId') memberId?: string, @Query('limit') limit?: string) {
    return this.notifications.getLogs(memberId, limit ? parseInt(limit, 10) : 50);
  }
}
