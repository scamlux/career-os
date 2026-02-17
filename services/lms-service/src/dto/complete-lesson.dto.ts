import { IsInt, IsString, Min } from 'class-validator';

export class CompleteLessonDto {
  @IsString()
  userId!: string;

  @IsString()
  tenantId!: string;

  @IsString()
  courseId!: string;

  @IsString()
  lessonId!: string;

  @IsInt()
  @Min(0)
  timeSpentMinutes!: number;
}
