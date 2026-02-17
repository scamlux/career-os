import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  instructorId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceUsd?: number;
}
