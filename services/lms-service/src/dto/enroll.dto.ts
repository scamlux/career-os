import { IsString } from 'class-validator';

export class EnrollDto {
  @IsString()
  userId!: string;

  @IsString()
  courseId!: string;

  @IsString()
  tenantId!: string;
}
