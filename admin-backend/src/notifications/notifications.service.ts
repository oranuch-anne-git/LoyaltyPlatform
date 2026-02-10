import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async log(memberId: string | null, channel: string, type: string, payload: Record<string, unknown>) {
    return this.prisma.notificationLog.create({
      data: {
        memberId,
        channel,
        type,
        payload: JSON.stringify(payload),
        status: 'SENT',
      },
    });
  }

  async getLogs(memberId?: string, limit = 50) {
    const where = memberId ? { memberId } : {};
    return this.prisma.notificationLog.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: limit,
    });
  }
}
