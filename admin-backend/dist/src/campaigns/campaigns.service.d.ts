import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';
export declare class CampaignsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCampaignDto): Promise<{
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
    }>;
    findAll(activeOnly?: boolean): Promise<{
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
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, dto: UpdateCampaignDto): Promise<{
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
    }>;
    getBanners(): Promise<{
        id: string;
        sortOrder: number;
        active: boolean;
        createdAt: Date;
        campaignId: string | null;
        title: string;
        imageUrl: string | null;
        linkUrl: string | null;
    }[]>;
    createBanner(campaignId: string | null, title: string, imageUrl?: string, linkUrl?: string, sortOrder?: number): Promise<{
        id: string;
        sortOrder: number;
        active: boolean;
        createdAt: Date;
        campaignId: string | null;
        title: string;
        imageUrl: string | null;
        linkUrl: string | null;
    }>;
}
