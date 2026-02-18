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

export class UpdateRoadmapDraftCanvasDto {
  @IsString()
  userId!: string;

  canvasViewport!: CanvasViewportDto;

  @IsOptional()
  @IsArray()
  roadmapNodes?: RoadmapNodeDto[];
}
