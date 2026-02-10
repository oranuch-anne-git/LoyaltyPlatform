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
exports.PointsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const points_service_1 = require("./points.service");
const dto_1 = require("./dto");
const common_2 = require("@nestjs/common");
let PointsController = class PointsController {
    constructor(points) {
        this.points = points;
    }
    getBalance(memberId) {
        return this.points.getBalance(memberId);
    }
    earn(dto, req) {
        return this.points.earn(dto, req.user?.id);
    }
    redeem(dto) {
        return this.points.redeem(dto);
    }
    adjust(dto, req) {
        return this.points.adjust(dto, req.user.id);
    }
    getLedger(memberId, limit) {
        return this.points.getLedger(memberId, limit ? parseInt(limit, 10) : 50);
    }
    getTransactions(memberId, limit) {
        return this.points.getTransactions(memberId, limit ? parseInt(limit, 10) : 50);
    }
};
exports.PointsController = PointsController;
__decorate([
    (0, common_1.Get)('balance/:memberId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PointsController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Post)('earn'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.EarnPointsDto, Object]),
    __metadata("design:returntype", void 0)
], PointsController.prototype, "earn", null);
__decorate([
    (0, common_1.Post)('redeem'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RedeemPointsDto]),
    __metadata("design:returntype", void 0)
], PointsController.prototype, "redeem", null);
__decorate([
    (0, common_1.Post)('adjust'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AdjustPointsDto, Object]),
    __metadata("design:returntype", void 0)
], PointsController.prototype, "adjust", null);
__decorate([
    (0, common_1.Get)('ledger/:memberId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('memberId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PointsController.prototype, "getLedger", null);
__decorate([
    (0, common_1.Get)('transactions/:memberId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('memberId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PointsController.prototype, "getTransactions", null);
exports.PointsController = PointsController = __decorate([
    (0, common_1.Controller)('api/points'),
    __metadata("design:paramtypes", [points_service_1.PointsService])
], PointsController);
//# sourceMappingURL=points.controller.js.map