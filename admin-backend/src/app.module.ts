import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { PointsModule } from './points/points.module';
import { RewardsModule } from './rewards/rewards.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { LineWebhookModule } from './line-webhook/line-webhook.module';
import { BranchModule } from './branch/branch.module';
import { AuditModule } from './audit/audit.module';
import { LocationModule } from './location/location.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    LocationModule,
    MemberModule,
    PointsModule,
    RewardsModule,
    CampaignsModule,
    NotificationsModule,
    AnalyticsModule,
    LineWebhookModule,
    BranchModule,
  ],
})
export class AppModule {}
