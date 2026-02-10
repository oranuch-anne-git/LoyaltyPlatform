"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineWebhookModule = void 0;
const common_1 = require("@nestjs/common");
const line_webhook_controller_1 = require("./line-webhook.controller");
const line_webhook_service_1 = require("./line-webhook.service");
const member_module_1 = require("../member/member.module");
const notifications_module_1 = require("../notifications/notifications.module");
let LineWebhookModule = class LineWebhookModule {
};
exports.LineWebhookModule = LineWebhookModule;
exports.LineWebhookModule = LineWebhookModule = __decorate([
    (0, common_1.Module)({
        imports: [member_module_1.MemberModule, notifications_module_1.NotificationsModule],
        controllers: [line_webhook_controller_1.LineWebhookController],
        providers: [line_webhook_service_1.LineWebhookService],
        exports: [line_webhook_service_1.LineWebhookService],
    })
], LineWebhookModule);
//# sourceMappingURL=line-webhook.module.js.map