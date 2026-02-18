import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequireFeature } from '@careeros/shared';
import { AICoreDomainService } from '../domain/ai-core.domain.service';
import { ChatMentorDto } from '../dto/chat.dto';
import { ExecuteFlowDto } from '../dto/execute-flow.dto';

@Controller('ai')
export class AICoreController {
  constructor(private readonly aiDomainService: AICoreDomainService) {}

  @Post('flows/execute')
  @RequireFeature('ai.flow.execute')
  async executeFlow(@Body() dto: ExecuteFlowDto) {
    return this.aiDomainService.executeFlow({
      flowName: dto.flowName,
      flowVersion: dto.flowVersion,
      userId: dto.userId,
      tenantId: dto.tenantId,
      data: dto.input
    });
  }

  @Get('usage/:userId')
  async getUsage(@Param('userId') userId: string) {
    return this.aiDomainService.getFlowUsage(userId);
  }

  @Post('chat')
  async chatMentor(@Body() dto: ChatMentorDto) {
    return this.aiDomainService.chatMentor({
      userId: dto.userId,
      tenantId: dto.tenantId,
      mode: dto.mode,
      messages: dto.messages
    });
  }
}
