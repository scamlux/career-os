import { IsString } from 'class-validator';

export class CompleteMilestoneDto {
  @IsString()
  milestoneId!: string;

  @IsString()
  tenantId!: string;

  @IsString()
  userId!: string;
}
