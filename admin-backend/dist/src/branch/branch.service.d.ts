import { PrismaService } from '../prisma/prisma.service';
export declare class BranchService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(activeOnly?: boolean): Promise<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        address: string | null;
        region: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        address: string | null;
        region: string | null;
    }>;
    create(code: string, name: string, address?: string, region?: string): Promise<{
        id: string;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        address: string | null;
        region: string | null;
    }>;
}
