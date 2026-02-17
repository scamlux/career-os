import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubscriptionBillingDomainService } from '../domain/subscription-billing.domain.service';
import { ActivateSubscriptionDto } from '../dto/activate-subscription.dto';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { BillingWebhookDto } from '../dto/webhook.dto';

@Controller('billing')
export class SubscriptionBillingController {
  constructor(private readonly billingDomainService: SubscriptionBillingDomainService) {}

  @Post('plans')
  async createPlan(@Body() dto: CreatePlanDto) {
    await this.billingDomainService.createPlan({
      code: dto.code,
      name: dto.name,
      billingInterval: dto.billingInterval,
      priceUsd: dto.priceUsd,
      features: dto.features ?? [],
      aiQuotaMonthly: dto.aiQuotaMonthly
    });

    return { ok: true };
  }

  @Post('subscriptions/activate')
  async activate(@Body() dto: ActivateSubscriptionDto) {
    return this.billingDomainService.activateSubscription({
      userId: dto.userId,
      organizationId: dto.organizationId,
      tenantId: dto.tenantId,
      planCode: dto.planCode,
      status: dto.status
    });
  }

  @Post('webhooks')
  async webhooks(@Body() dto: BillingWebhookDto) {
    await this.billingDomainService.processWebhook(dto.eventType, dto.payload);
    return { ok: true };
  }

  @Get('subscriptions/:userId')
  async getActive(@Param('userId') userId: string) {
    return this.billingDomainService.getActiveSubscription(userId);
  }
}
