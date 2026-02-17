import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
