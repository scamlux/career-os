import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoadmapDto {
  @IsString()
  userId!: string;

  @IsString()
  tenantId!: string;

  @IsString()
  goalKey!: string;

  @IsString()
  targetRole!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  timelineWeeks?: number;

  @IsOptional()
  @IsArray()
  stageTitles?: string[];
}
