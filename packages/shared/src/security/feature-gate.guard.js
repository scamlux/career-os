"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureGateGuard = exports.FEATURE_KEY = void 0;
exports.RequireFeature = RequireFeature;
const common_1 = require("@nestjs/common");
exports.FEATURE_KEY = 'feature_key';
function RequireFeature(featureKey) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(exports.FEATURE_KEY, featureKey));
}
let FeatureGateGuard = class FeatureGateGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (!request) {
            return true;
        }
        const requiredFeature = Reflect.getMetadata(exports.FEATURE_KEY, context.getHandler());
        if (!requiredFeature) {
            return true;
        }
        const featureHeader = request.headers['x-plan-features'];
        const enabled = typeof featureHeader === 'string' ? featureHeader.split(',') : [];
        if (!enabled.includes(requiredFeature)) {
            throw new common_1.ForbiddenException(`Feature '${requiredFeature}' is not available in current plan`);
        }
        return true;
    }
};
exports.FeatureGateGuard = FeatureGateGuard;
exports.FeatureGateGuard = FeatureGateGuard = __decorate([
    (0, common_1.Injectable)()
], FeatureGateGuard);
//# sourceMappingURL=feature-gate.guard.js.map