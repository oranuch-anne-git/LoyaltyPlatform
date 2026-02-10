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
exports.LineWebhookService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const member_service_1 = require("../member/member.service");
const notifications_service_1 = require("../notifications/notifications.service");
let LineWebhookService = class LineWebhookService {
    constructor(prisma, member, notifications) {
        this.prisma = prisma;
        this.member = member;
        this.notifications = notifications;
    }
    async handleFollow(lineUserId, displayName) {
        const existing = await this.prisma.member.findUnique({
            where: { lineUserId },
        });
        if (existing)
            return { memberId: existing.memberId, isNew: false };
        const member = await this.member.create({
            lineUserId,
            displayName: displayName || 'LINE User',
            channel: 'LINE',
        });
        return { memberId: member.memberId, isNew: true };
    }
    async handleMessage(lineUserId, message) {
        const member = await this.prisma.member.findUnique({
            where: { lineUserId },
        });
        if (!member)
            return { reply: 'Please follow our account first to use the loyalty program.' };
        if (message.trim().toLowerCase() === 'points' || message.trim().toLowerCase() === 'balance') {
            return { reply: `Your current points: ${member.pointBalance}`, memberId: member.id };
        }
        return { reply: 'Reply "points" to check your balance.', memberId: member.id };
    }
};
exports.LineWebhookService = LineWebhookService;
exports.LineWebhookService = LineWebhookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        member_service_1.MemberService,
        notifications_service_1.NotificationsService])
], LineWebhookService);
//# sourceMappingURL=line-webhook.service.js.map