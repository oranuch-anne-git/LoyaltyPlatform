import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';
export declare class CampaignsController {
    private campaigns;
    constructor(campaigns: CampaignsService);
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
    findAll(active?: string): Promise<{
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
    createBanner(body: {
        campaignId?: string;
        title: string;
        imageUrl?: string;
        linkUrl?: string;
        sortOrder?: number;
    }): Promise<{
        id: string;
        sortOrder: number;
        active: boolean;
        createdAt: Date;
        campaignId: string | null;
        title: string;
        imageUrl: string | null;
        linkUrl: string | null;
    }>;
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
}
