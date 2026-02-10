import { PointsService } from './points.service';
import { EarnPointsDto, RedeemPointsDto, AdjustPointsDto } from './dto';
import { Request } from 'express';
export declare class PointsController {
    private points;
    constructor(points: PointsService);
    getBalance(memberId: string): Promise<number>;
    earn(dto: EarnPointsDto, req: Request & {
        user?: {
            id: string;
        };
    }): Promise<{
        balance: number;
        earned: number;
    }>;
    redeem(dto: RedeemPointsDto): Promise<{
        balance: number;
        redeemed: number;
    }>;
    adjust(dto: AdjustPointsDto, req: Request & {
        user?: {
            id: string;
        };
    }): Promise<{
        balance: number;
    }>;
    getLedger(memberId: string, limit?: string): Promise<{
        id: string;
        createdAt: Date;
        memberId: string;
        type: string;
        balance: number;
        change: number;
        referenceId: string | null;
        expiresAt: Date | null;
    }[]>;
    getTransactions(memberId: string, limit?: string): Promise<{
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
