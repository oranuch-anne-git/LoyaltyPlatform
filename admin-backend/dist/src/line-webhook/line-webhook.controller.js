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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineWebhookController = void 0;
const common_1 = require("@nestjs/common");
const line_webhook_service_1 = require("./line-webhook.service");
const crypto = require("crypto");
let LineWebhookController = class LineWebhookController {
    constructor(line) {
        this.line = line;
    }
    getWebhook() {
        return { status: 'LINE webhook endpoint. Use POST for events.' };
    }
    async handleWebhook(req, res, body) {
        const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
        if (channelSecret && body.destination) {
            const signature = req.headers['x-line-signature'];
            if (signature) {
                const hash = crypto.createHmac('sha256', channelSecret).update(JSON.stringify(body)).digest('base64');
                if (hash !== signature) {
                    res.status(401).send('Invalid signature');
                    return;
                }
            }
        }
        const events = body.events || [];
        for (const event of events) {
            if (event.type === 'follow') {
                await this.line.handleFollow(event.source.userId, event.profile?.displayName);
            }
            if (event.type === 'message' && event.message?.type === 'text') {
                await this.line.handleMessage(event.source.userId, event.message.text);
            }
        }
        res.status(200).send('OK');
    }
};
exports.LineWebhookController = LineWebhookController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LineWebhookController.prototype, "getWebhook", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], LineWebhookController.prototype, "handleWebhook", null);
exports.LineWebhookController = LineWebhookController = __decorate([
    (0, common_1.Controller)('webhook/line'),
    __metadata("design:paramtypes", [line_webhook_service_1.LineWebhookService])
], LineWebhookController);
//# sourceMappingURL=line-webhook.controller.js.map