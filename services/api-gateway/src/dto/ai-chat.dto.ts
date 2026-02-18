import { IsArray, IsString } from 'class-validator';

class ChatMessageDto {
  @IsString()
  role!: string;

  @IsString()
  content!: string;
}

export class GatewayAIChatDto {
  @IsString()
  userId!: string;

  @IsString()
  tenantId!: string;

  @IsString()
  mode!: string;

  @IsArray()
  messages!: ChatMessageDto[];
}
