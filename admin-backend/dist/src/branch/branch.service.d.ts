import { PrismaService } from '../prisma/prisma.service';
export declare class BranchService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(activeOnly?: boolean): Promise<{
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
    create(code: string, name: string, address?: string, region?: string): Promise<{
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
