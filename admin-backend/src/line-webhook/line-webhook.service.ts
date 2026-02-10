import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberService } from '../member/member.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LineWebhookService {
  constructor(
    private prisma: PrismaService,
    private member: MemberService,
    private notifications: NotificationsService,
  ) {}

  async handleFollow(lineUserId: string, displayName?: string) {
    const existing = await this.prisma.member.findUnique({
      where: { lineUserId },
    });
    if (existing) return { memberId: existing.memberId, isNew: false };
    const member = await this.member.create({
      lineUserId,
      displayName: displayName || 'LINE User',
      channel: 'LINE',
    });
    return { memberId: member.memberId, isNew: true };
  }

  async handleMessage(lineUserId: string, message: string) {
    const member = await this.prisma.member.findUnique({
      where: { lineUserId },
    });
    if (!member) return { reply: 'Please follow our account first to use the loyalty program.' };
    if (message.trim().toLowerCase() === 'points' || message.trim().toLowerCase() === 'balance') {
      return { reply: `Your current points: ${member.pointBalance}`, memberId: member.id };
    }
    return { reply: 'Reply "points" to check your balance.', memberId: member.id };
  }
}
