"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
const audit_service_1 = require("../audit/audit.service");
const API_KEY_USER_EMAIL = 'api-key@loyalty.local';
let AuthService = class AuthService {
    constructor(prisma, jwt, audit, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.audit = audit;
        this.config = config;
    }
    async validateAdmin(email, password) {
        const admin = await this.prisma.adminUser.findUnique({
            where: { email, active: true },
            include: { role: true },
        });
        if (!admin)
            return null;
        const hash = this.hashPassword(password, admin.email);
        if (admin.passwordHash !== hash)
            return null;
        return admin;
    }
    async login(email, password, ip) {
        const admin = await this.validateAdmin(email, password);
        if (!admin)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = { sub: admin.id, email: admin.email, role: admin.role.name };
        const access_token = this.jwt.sign(payload);
        await this.audit.log({
            adminId: admin.id,
            action: 'LOGIN',
            resource: 'AUTH',
            details: JSON.stringify({ email: admin.email }),
            ip,
        });
        return {
            access_token,
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role.name,
            },
        };
    }
    async loginWithApiKey(apiKey, ip) {
        const configuredKeys = this.config.get('API_KEY') || this.config.get('API_KEYS') || '';
        const validKeys = configuredKeys.split(',').map((k) => k.trim()).filter(Boolean);
        if (validKeys.length === 0 || !apiKey || !validKeys.includes(apiKey)) {
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        const admin = await this.prisma.adminUser.findUnique({
            where: { email: API_KEY_USER_EMAIL, active: true },
            include: { role: true },
        });
        if (!admin)
            throw new common_1.UnauthorizedException('API key user not configured. Run seed.');
        const payload = { sub: admin.id, email: admin.email, role: admin.role.name };
        const access_token = this.jwt.sign(payload);
        await this.audit.log({
            adminId: admin.id,
            action: 'LOGIN_API_KEY',
            resource: 'AUTH',
            details: JSON.stringify({ method: 'api_key' }),
            ip,
        });
        return {
            access_token,
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role.name,
            },
        };
    }
    hashPassword(password, salt) {
        return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    }
    async createAdminUser(email, password, name, roleName) {
        const role = await this.prisma.role.findFirst({ where: { name: roleName } });
        if (!role)
            throw new Error('Role not found');
        const passwordHash = this.hashPassword(password, email);
        return this.prisma.adminUser.create({
            data: { email, passwordHash, name, roleId: role.id },
            include: { role: true },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        audit_service_1.AuditService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map