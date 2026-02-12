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
exports.LocationController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const location_service_1 = require("./location.service");
let LocationController = class LocationController {
    constructor(location) {
        this.location = location;
    }
    getProvinces() {
        return this.location.getProvinces();
    }
    getDistricts(provinceCode) {
        return this.location.getDistricts(provinceCode || '');
    }
    getSubdistricts(districtId, districtCode, provinceCode) {
        if (districtCode?.trim()) {
            return this.location.getSubdistrictsByDistrictCode(districtCode.trim(), provinceCode?.trim() || undefined);
        }
        return this.location.getSubdistricts(districtId || '');
    }
    getByZipCode(zipCode) {
        return this.location.getByZipCode(zipCode || '');
    }
};
exports.LocationController = LocationController;
__decorate([
    (0, common_1.Get)('provinces'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LocationController.prototype, "getProvinces", null);
__decorate([
    (0, common_1.Get)('districts'),
    __param(0, (0, common_1.Query)('provinceCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationController.prototype, "getDistricts", null);
__decorate([
    (0, common_1.Get)('subdistricts'),
    __param(0, (0, common_1.Query)('districtId')),
    __param(1, (0, common_1.Query)('districtCode')),
    __param(2, (0, common_1.Query)('provinceCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], LocationController.prototype, "getSubdistricts", null);
__decorate([
    (0, common_1.Get)('by-zip'),
    __param(0, (0, common_1.Query)('zipCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationController.prototype, "getByZipCode", null);
exports.LocationController = LocationController = __decorate([
    (0, common_1.Controller)('api'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [location_service_1.LocationService])
], LocationController);
//# sourceMappingURL=location.controller.js.map