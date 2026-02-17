import { IsObject, IsOptional, IsString } from 'class-validator';

export class ExecuteFlowDto {
  @IsString()
  flowName!: string;

  @IsOptional()
  @IsString()
  flowVersion?: string;

  @IsObject()
  input!: Record<string, unknown>;

  @IsString()
  userId!: string;

  @IsString()
  tenantId!: string;
}
