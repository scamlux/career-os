import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AICoreDomainService } from '../domain/ai-core.domain.service';

type ExecuteFlowRequest = {
  flow_name: string;
  flow_version?: string;
  input_json: string;
  meta?: {
    user_id?: string;
    tenant_id?: string;
  };
};

type GetFlowUsageRequest = {
  user_id: string;
};

@Controller()
export class AICoreGrpcController {
  constructor(private readonly aiDomainService: AICoreDomainService) {}

  @GrpcMethod('AICoreService', 'ExecuteFlow')
  async executeFlow(payload: ExecuteFlowRequest) {
    const parsedInput = this.safeJsonParse(payload.input_json);
    const response = await this.aiDomainService.executeFlow({
      flowName: payload.flow_name,
      flowVersion: payload.flow_version,
      userId: payload.meta?.user_id ?? 'unknown-user',
      tenantId: payload.meta?.tenant_id ?? '00000000-0000-0000-0000-000000000000',
      data: parsedInput
    });

    return {
      execution_id: response.execution_id,
      status: response.status,
      output_json: response.output_json,
      confidence: response.confidence
    };
  }

  @GrpcMethod('AICoreService', 'GetFlowUsage')
  async getFlowUsage(payload: GetFlowUsageRequest) {
    return this.aiDomainService.getFlowUsage(payload.user_id);
  }

  private safeJsonParse(input: string): Record<string, unknown> {
    try {
      const parsed = JSON.parse(input) as Record<string, unknown>;
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  }
}
