import { IsArray, IsString } from 'class-validator';

class ChatMessageDto {
  @IsString()
  role!: string;

  @IsString()
  content!: string;
}

export class ChatMentorDto {
  @IsString()
  userId!: string;

  @IsString()
  tenantId!: string;

  @IsString()
  mode!: string;

  @IsArray()
  messages!: ChatMessageDto[];
}
