import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare const FEATURE_KEY = "feature_key";
export declare function RequireFeature(featureKey: string): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare class FeatureGateGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
