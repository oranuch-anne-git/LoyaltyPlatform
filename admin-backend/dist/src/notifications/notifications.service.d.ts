import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    log(memberId: string | null, channel: string, type: string, payload: Record<string, unknown>): Promise<{
        id: string;
        memberId: string | null;
        channel: string;
        type: string;
        status: string;
        payload: string | null;
        sentAt: Date;
    }>;
    getLogs(memberId?: string, limit?: number): Promise<{
        id: string;
        memberId: string | null;
        channel: string;
        type: string;
        status: string;
        payload: string | null;
        sentAt: Date;
    }[]>;
}
