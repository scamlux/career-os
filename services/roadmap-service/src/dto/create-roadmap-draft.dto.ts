import { IsArray, IsOptional, IsString } from 'class-validator';

type CanvasViewportDto = {
  x: number;
  y: number;
  scale: number;
};

type RoadmapNodeDto = {
  id: string;
  label: string;
  progress: number;
  x: number;
  y: number;
};

type DiscoveryItemDto = {
  question: string;
  answer: string;
};

export class CreateRoadmapDraftDto {
  @IsString()
  userId!: string;

  @IsString()
  tenantId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  targetRole?: string;

  @IsOptional()
  @IsString()
  targetGrade?: string;

  @IsOptional()
  @IsArray()
  interviewLog?: DiscoveryItemDto[];

  @IsOptional()
  @IsArray()
  roadmapNodes?: RoadmapNodeDto[];

  @IsOptional()
  canvasViewport?: CanvasViewportDto;
}
