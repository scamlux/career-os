import { IsArray, IsOptional, IsString } from 'class-validator';

class InterviewMessageDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;
}

export class InterviewTurnDto {
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
