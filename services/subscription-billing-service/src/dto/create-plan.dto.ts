import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsString()
  billingInterval!: string;

  @IsNumber()
  @Min(0)
  priceUsd!: number;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  aiQuotaMonthly?: number;
}
