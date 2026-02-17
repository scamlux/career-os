import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserProfileDomainService } from '../domain/user-profile.domain.service';

type GetProfileRequest = {
  user_id: string;
};

type GetSkillMatrixRequest = {
  user_id: string;
};

@Controller()
export class UserProfileGrpcController {
  constructor(private readonly profileDomainService: UserProfileDomainService) {}

  @GrpcMethod('UserProfileService', 'GetProfile')
  async getProfile(payload: GetProfileRequest) {
    return this.profileDomainService.getProfile(payload.user_id);
  }

  @GrpcMethod('UserProfileService', 'GetUserSkillMatrix')
  async getUserSkillMatrix(payload: GetSkillMatrixRequest) {
    const skills = await this.profileDomainService.getSkillMatrix(payload.user_id);
    return { skills };
  }
}
