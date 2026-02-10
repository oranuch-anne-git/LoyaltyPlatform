import { PrismaService } from '../prisma/prisma.service';
export interface AuditEntry {
    adminId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: string;
    ip?: string;
}
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(entry: AuditEntry): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        resource: string;
        resourceId: string | null;
        details: string | null;
        ip: string | null;
        adminId: string | null;
    }>;
}
