import { PrismaService } from '../prisma/prisma.service';
import { MemberService } from '../member/member.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class LineWebhookService {
    private prisma;
    private member;
    private notifications;
    constructor(prisma: PrismaService, member: MemberService, notifications: NotificationsService);
    handleFollow(lineUserId: string, lineDisplayName?: string): Promise<{
        memberId: string;
        isNew: boolean;
    }>;
    handleMessage(lineUserId: string, message: string): Promise<{
        reply: string;
        memberId?: undefined;
    } | {
        reply: string;
        memberId: string;
    }>;
}
