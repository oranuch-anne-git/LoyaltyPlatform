import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<{
        totalMembers: number;
        activeCampaigns: number;
        totalRedemptions: number;
        totalPointsEarned: number;
        totalPointsRedeemed: number;
    }>;
    getCampaignPerformance(): Promise<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        validFrom: Date;
        validTo: Date;
        type: string;
        conditions: string | null;
        config: string | null;
    }[]>;
    getAuditLogs(limit?: number): Promise<({
        adminUser: {
            name: string | null;
            email: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        action: string;
        resource: string;
        resourceId: string | null;
        details: string | null;
        ip: string | null;
        adminId: string | null;
    })[]>;
}
