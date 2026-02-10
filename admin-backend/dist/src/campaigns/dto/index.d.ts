export declare class CreateCampaignDto {
    name: string;
    type: string;
    description?: string;
    conditions?: string;
    config?: string;
    validFrom: string;
    validTo: string;
}
export declare class UpdateCampaignDto {
    name?: string;
    type?: string;
    description?: string;
    conditions?: string;
    config?: string;
    validFrom?: string;
    validTo?: string;
    active?: boolean;
}
