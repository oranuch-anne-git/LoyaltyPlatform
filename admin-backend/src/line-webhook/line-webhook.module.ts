import { Module } from '@nestjs/common';
import { LineWebhookController } from './line-webhook.controller';
import { LineWebhookService } from './line-webhook.service';
import { MemberModule } from '../member/member.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MemberModule, NotificationsModule],
  controllers: [LineWebhookController],
  providers: [LineWebhookService],
  exports: [LineWebhookService],
})
export class LineWebhookModule {}
