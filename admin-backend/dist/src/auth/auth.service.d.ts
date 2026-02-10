import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class AuthService {
    private prisma;
    private jwt;
    private audit;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, audit: AuditService, config: ConfigService);
    validateAdmin(email: string, password: string): Promise<({
        role: {
            id: string;
            name: string;
            permissions: string;
        };
    } & {
        id: string;
        name: string | null;
        email: string;
        passwordHash: string;
        roleId: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    login(email: string, password: string, ip?: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: string;
        };
    }>;
    loginWithApiKey(apiKey: string, ip?: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: string;
        };
    }>;
    hashPassword(password: string, salt: string): string;
    createAdminUser(email: string, password: string, name: string, roleName: string): Promise<{
        role: {
            id: string;
            name: string;
            permissions: string;
        };
    } & {
        id: string;
        name: string | null;
        email: string;
        passwordHash: string;
        roleId: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
