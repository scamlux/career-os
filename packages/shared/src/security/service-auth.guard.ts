import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServiceAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request) {
      return true;
    }

    const expected = this.configService.get<string>('SERVICE_SHARED_SECRET');
    const provided = request.headers['x-service-token'] as string | undefined;

    if (!expected || provided !== expected) {
      throw new UnauthorizedException('Invalid service token');
    }

    return true;
  }
}
