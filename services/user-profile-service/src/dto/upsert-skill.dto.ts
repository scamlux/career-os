import { IsNumber, IsString, Max, Min } from 'class-validator';

export class UpsertSkillDto {
  @IsString()
  skillKey!: string;

  @IsString()
  skillName!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  proficiency!: number;
}
