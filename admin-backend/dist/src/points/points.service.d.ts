import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EarnPointsDto, RedeemPointsDto, AdjustPointsDto } from './dto';
export declare class PointsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    getBalance(memberId: string): Promise<number>;
    earn(dto: EarnPointsDto, adminId?: string): Promise<{
        balance: number;
        earned: number;
    }>;
    redeem(dto: RedeemPointsDto): Promise<{
        balance: number;
        redeemed: number;
    }>;
    adjust(dto: AdjustPointsDto, adminId: string): Promise<{
        balance: number;
    }>;
    getLedger(memberId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        memberId: string;
        type: string;
        balance: number;
        change: number;
        referenceId: string | null;
        expiresAt: Date | null;
    }[]>;
    getTransactions(memberId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        memberId: string;
        type: string;
        referenceId: string | null;
        amount: number;
        branchId: string | null;
        metadata: string | null;
    }[]>;
}
