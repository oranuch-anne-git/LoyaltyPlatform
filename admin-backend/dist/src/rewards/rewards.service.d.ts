import { PrismaService } from '../prisma/prisma.service';
import { PointsService } from '../points/points.service';
import { CreateRewardDto, UpdateRewardDto, RedeemRewardDto } from './dto';
export declare class RewardsService {
    private prisma;
    private points;
    constructor(prisma: PrismaService, points: PointsService);
    create(dto: CreateRewardDto): Promise<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        partnerId: string | null;
        pointCost: number;
        quantity: number;
        validFrom: Date | null;
        validTo: Date | null;
    }>;
    findAll(category?: string, activeOnly?: boolean): Promise<({
        redemptions: {
            id: string;
            createdAt: Date;
            memberId: string;
            branchId: string | null;
            pointsUsed: number;
            status: string;
            rewardId: string;
        }[];
    } & {
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        partnerId: string | null;
        pointCost: number;
        quantity: number;
        validFrom: Date | null;
        validTo: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        redemptions: {
            id: string;
            createdAt: Date;
            memberId: string;
            branchId: string | null;
            pointsUsed: number;
            status: string;
            rewardId: string;
        }[];
    } & {
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        partnerId: string | null;
        pointCost: number;
        quantity: number;
        validFrom: Date | null;
        validTo: Date | null;
    }>;
    update(id: string, dto: UpdateRewardDto): Promise<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        partnerId: string | null;
        pointCost: number;
        quantity: number;
        validFrom: Date | null;
        validTo: Date | null;
    }>;
    redeem(dto: RedeemRewardDto): Promise<{
        reward: {
            id: string;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            partnerId: string | null;
            pointCost: number;
            quantity: number;
            validFrom: Date | null;
            validTo: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        memberId: string;
        branchId: string | null;
        pointsUsed: number;
        status: string;
        rewardId: string;
    }>;
}
