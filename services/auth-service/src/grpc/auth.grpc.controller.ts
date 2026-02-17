import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthDomainService } from '../domain/auth.domain.service';

type ValidateAccessTokenRequest = {
  access_token: string;
};

type GetUserPermissionsRequest = {
  user_id: string;
};

@Controller()
export class AuthGrpcController {
  constructor(private readonly authDomainService: AuthDomainService) {}

  @GrpcMethod('AuthService', 'ValidateAccessToken')
  validateAccessToken(payload: ValidateAccessTokenRequest) {
    return this.authDomainService.validateAccessToken(payload.access_token);
  }

  @GrpcMethod('AuthService', 'GetUserPermissions')
  async getUserPermissions(payload: GetUserPermissionsRequest) {
    const permissions = await this.authDomainService.getPermissions(payload.user_id);
    return { permissions };
  }
}
