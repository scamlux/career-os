import { IsObject, IsString } from 'class-validator';

export class BillingWebhookDto {
  @IsString()
  eventType!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
