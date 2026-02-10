export declare class CreateRewardDto {
    name: string;
    description?: string;
    category: string;
    partnerId?: string;
    pointCost: number;
    quantity?: number;
    validFrom?: Date;
    validTo?: Date;
}
export declare class UpdateRewardDto {
    name?: string;
    description?: string;
    category?: string;
    pointCost?: number;
    quantity?: number;
    validFrom?: Date;
    validTo?: Date;
    active?: boolean;
}
export declare class RedeemRewardDto {
    memberId: string;
    rewardId: string;
    branchId?: string;
}
