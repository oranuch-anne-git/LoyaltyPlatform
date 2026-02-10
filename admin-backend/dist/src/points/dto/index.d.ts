export declare class EarnPointsDto {
    memberId: string;
    points: number;
    campaignId?: string;
    referenceId?: string;
    branchId?: string;
    expiresAt?: Date;
    metadata?: string;
}
export declare class RedeemPointsDto {
    memberId: string;
    points: number;
    rewardId?: string;
    referenceId?: string;
    branchId?: string;
    metadata?: string;
}
export declare class AdjustPointsDto {
    memberId: string;
    points: number;
    reason?: string;
}
