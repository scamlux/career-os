import { IsOptional, IsString } from 'class-validator';

export class ActivateSubscriptionDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsString()
  tenantId!: string;

  @IsString()
  planCode!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
