import { Body, Controller, Get, Param, Put, Post, Headers } from '@nestjs/common';
import { UserProfileDomainService } from '../domain/user-profile.domain.service';
import { UpsertProfileDto } from '../dto/upsert-profile.dto';
import { UpsertSkillDto } from '../dto/upsert-skill.dto';

@Controller('profiles')
export class UserProfileController {
  constructor(private readonly profileDomainService: UserProfileDomainService) {}

  @Get(':userId')
  async getProfile(@Param('userId') userId: string) {
    return this.profileDomainService.getProfile(userId);
  }

  @Put(':userId')
  async upsertProfile(
    @Param('userId') userId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000000',
    @Body() dto: UpsertProfileDto
  ) {
    await this.profileDomainService.upsertProfile(userId, tenantId, dto);
    return { ok: true };
  }

  @Post(':userId/skills')
  async upsertSkill(
    @Param('userId') userId: string,
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000000',
    @Body() dto: UpsertSkillDto
  ) {
    await this.profileDomainService.upsertSkill(userId, tenantId, dto.skillKey, dto.skillName, dto.proficiency);
    return { ok: true };
  }
}
