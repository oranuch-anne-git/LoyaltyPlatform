"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const member_module_1 = require("./member/member.module");
const points_module_1 = require("./points/points.module");
const rewards_module_1 = require("./rewards/rewards.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const notifications_module_1 = require("./notifications/notifications.module");
const analytics_module_1 = require("./analytics/analytics.module");
const line_webhook_module_1 = require("./line-webhook/line-webhook.module");
const branch_module_1 = require("./branch/branch.module");
const audit_module_1 = require("./audit/audit.module");
const location_module_1 = require("./location/location.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            audit_module_1.AuditModule,
            auth_module_1.AuthModule,
            location_module_1.LocationModule,
            member_module_1.MemberModule,
            points_module_1.PointsModule,
            rewards_module_1.RewardsModule,
            campaigns_module_1.CampaignsModule,
            notifications_module_1.NotificationsModule,
            analytics_module_1.AnalyticsModule,
            line_webhook_module_1.LineWebhookModule,
            branch_module_1.BranchModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map