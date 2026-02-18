import { IsArray, IsOptional, IsString } from 'class-validator';

class InterviewMessageDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;
}

export class RoadmapInterviewTurnDto {
  @IsString()
  userId!: string;

  @IsString()
  tenantId!: string;

  @IsOptional()
  @IsString()
  draftId?: string;

  @IsArray()
  messages!: InterviewMessageDto[];
}

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
  interviewLog?: Array<{ question: string; answer: string }>;

  @IsOptional()
  @IsArray()
  roadmapNodes?: Array<{ id: string; label: string; progress: number; x: number; y: number }>;

  @IsOptional()
  canvasViewport?: { x: number; y: number; scale: number };
}

export class UpdateRoadmapDraftCanvasDto {
  @IsString()
  userId!: string;

  canvasViewport!: { x: number; y: number; scale: number };

  @IsOptional()
  @IsArray()
  roadmapNodes?: Array<{ id: string; label: string; progress: number; x: number; y: number }>;
}
