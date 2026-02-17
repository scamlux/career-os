import { IsObject, IsOptional, IsString } from 'class-validator';

export class GatewayExecuteFlowDto {
  @IsString()
  userId!: string;

  @IsString()
  tenantId!: string;

  @IsString()
  flowName!: string;

  @IsOptional()
  @IsString()
  flowVersion?: string;

  @IsObject()
  input!: Record<string, unknown>;
}
