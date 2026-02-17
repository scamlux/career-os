import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  applyDecorators
} from '@nestjs/common';

export const FEATURE_KEY = 'feature_key';

export function RequireFeature(featureKey: string) {
  return applyDecorators(SetMetadata(FEATURE_KEY, featureKey));
}

@Injectable()
export class FeatureGateGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request) {
      return true;
    }

    const requiredFeature = Reflect.getMetadata(FEATURE_KEY, context.getHandler()) as string | undefined;
    if (!requiredFeature) {
      return true;
    }

    const featureHeader = request.headers['x-plan-features'];
    const enabled = typeof featureHeader === 'string' ? featureHeader.split(',') : [];

    if (!enabled.includes(requiredFeature)) {
      throw new ForbiddenException(`Feature '${requiredFeature}' is not available in current plan`);
    }

    return true;
  }
}
