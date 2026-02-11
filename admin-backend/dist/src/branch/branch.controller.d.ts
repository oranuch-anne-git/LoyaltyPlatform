import { BranchService } from './branch.service';
export declare class BranchController {
    private branch;
    constructor(branch: BranchService);
    findAll(active?: string): Promise<{
        code: string;
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        region: string | null;
    }[]>;
    findOne(id: string): Promise<{
        code: string;
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        region: string | null;
    }>;
    create(body: {
        code: string;
        name: string;
        address?: string;
        region?: string;
    }): Promise<{
        code: string;
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        region: string | null;
    }>;
}
