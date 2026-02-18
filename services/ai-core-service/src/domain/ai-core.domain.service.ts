import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEnvelope, KafkaProducerService, PostgresService } from '@careeros/shared';
import { v4 as uuidv4 } from 'uuid';

type FlowDefinition = {
  flow_name: string;
  flow_version: string;
  prompt_version: string;
  required_output_fields: string[];
};

type FlowUsageRow = {
  requests_count: string;
  prompt_tokens: string;
  completion_tokens: string;
  total_cost_usd: string;
};

@Injectable()
export class AICoreDomainService {
  private readonly flowRegistry: Record<string, FlowDefinition> = {
    resume_analysis: {
      flow_name: 'resume_analysis',
      flow_version: 'v1',
      prompt_version: 'resume_prompt_v1',
      required_output_fields: ['summary', 'strengths', 'gaps']
    },
    skill_gap_analysis: {
      flow_name: 'skill_gap_analysis',
      flow_version: 'v1',
      prompt_version: 'skill_gap_prompt_v1',
      required_output_fields: ['current_skills', 'missing_skills', 'priority_order']
    },
    roadmap_generator: {
      flow_name: 'roadmap_generator',
      flow_version: 'v1',
      prompt_version: 'roadmap_prompt_v1',
      required_output_fields: ['stages', 'timeline_weeks', 'recommended_courses']
    },
    interview_simulation: {
      flow_name: 'interview_simulation',
      flow_version: 'v1',
      prompt_version: 'interview_prompt_v1',
      required_output_fields: ['questions', 'feedback', 'score']
    },
    productivity_advisor: {
      flow_name: 'productivity_advisor',
      flow_version: 'v1',
      prompt_version: 'productivity_prompt_v1',
      required_output_fields: ['observations', 'recommendations', 'next_week_plan']
    }
  };

  constructor(
    private readonly postgres: PostgresService,
    private readonly kafka: KafkaProducerService,
    private readonly configService: ConfigService
  ) {}

  async chatMentor(input: {
    userId: string;
    tenantId: string;
    mode: string;
    messages: Array<{ role: string; content: string }>;
  }): Promise<{ message: string; model: string; prompt_tokens: number; completion_tokens: number }> {
    if (!input.messages.length) {
      throw new BadRequestException('Chat messages are required');
    }

    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('OPENAI_API_KEY is not configured in ai-core-service');
    }

    const model = this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
    const systemPrompt =
      'You are CareerOS AI mentor. Give concise, practical career guidance, ask clarifying questions, and produce actionable next steps.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        messages: [
          {
            role: 'system',
            content: `${systemPrompt} Current mode: ${input.mode}.`
          },
          ...input.messages.map((item) => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: item.content
          }))
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ServiceUnavailableException(`OpenAI request failed: ${text}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    const message = data.choices?.[0]?.message?.content?.trim();
    if (!message) {
      throw new ServiceUnavailableException('OpenAI returned empty answer');
    }

    await this.kafka.publish(
      'careeros.ai.ai-flow-executed.v1',
      this.buildEnvelope('AIFlowExecuted', input.tenantId, input.userId, {
        execution_id: uuidv4(),
        flow_name: 'chat_mentor',
        flow_version: 'v1',
        status: 'SUCCESS',
        prompt_tokens: data.usage?.prompt_tokens ?? 0,
        completion_tokens: data.usage?.completion_tokens ?? 0,
        total_cost_usd: 0
      })
    );

    return {
      message,
      model,
      prompt_tokens: data.usage?.prompt_tokens ?? 0,
      completion_tokens: data.usage?.completion_tokens ?? 0
    };
  }

  async executeFlow(input: {
    flowName: string;
    flowVersion?: string;
    userId: string;
    tenantId: string;
    data: Record<string, unknown>;
  }): Promise<{
    execution_id: string;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    output_json: string;
    confidence: number;
  }> {
    this.validateInput(input.data);

    const flow = await this.resolveFlow(input.flowName, input.flowVersion);
    const executionId = uuidv4();
    const started = Date.now();

    const llmResult = await this.callModelWithFallback(flow, input.data);
    const outputValidation = this.validateFlowOutput(flow, llmResult.output);

    const status: 'SUCCESS' | 'PARTIAL' | 'FAILED' = outputValidation.valid
      ? 'SUCCESS'
      : llmResult.fallbackUsed
        ? 'PARTIAL'
        : 'FAILED';

    await this.postgres.query(
      `
      INSERT INTO ai_outputs (
        id,
        execution_id,
        conversation_id,
        user_id,
        flow_name,
        flow_version,
        output_json,
        status,
        confidence
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
      `,
      [
        uuidv4(),
        executionId,
        null,
        input.userId,
        flow.flow_name,
        flow.flow_version,
        JSON.stringify(llmResult.output),
        status,
        llmResult.confidence
      ]
    );

    await this.postgres.query(
      `
      INSERT INTO token_usage (
        id,
        execution_id,
        user_id,
        tenant_id,
        model_name,
        prompt_tokens,
        completion_tokens,
        total_cost_usd,
        latency_ms
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        uuidv4(),
        executionId,
        input.userId,
        input.tenantId,
        llmResult.model,
        llmResult.promptTokens,
        llmResult.completionTokens,
        llmResult.totalCostUsd,
        Date.now() - started
      ]
    );

    await this.kafka.publish(
      'careeros.ai.ai-flow-executed.v1',
      this.buildEnvelope('AIFlowExecuted', input.tenantId, input.userId, {
        execution_id: executionId,
        flow_name: flow.flow_name,
        flow_version: flow.flow_version,
        status,
        latency_ms: Date.now() - started,
        prompt_tokens: llmResult.promptTokens,
        completion_tokens: llmResult.completionTokens,
        total_cost_usd: llmResult.totalCostUsd
      })
    );

    return {
      execution_id: executionId,
      status,
      output_json: JSON.stringify(llmResult.output),
      confidence: llmResult.confidence
    };
  }

  async getFlowUsage(userId: string): Promise<{ requests_count: number; prompt_tokens: number; completion_tokens: number; total_cost_usd: number }> {
    const result = await this.postgres.query<FlowUsageRow>(
      `
      SELECT
        COUNT(*)::text AS requests_count,
        COALESCE(SUM(prompt_tokens), 0)::text AS prompt_tokens,
        COALESCE(SUM(completion_tokens), 0)::text AS completion_tokens,
        COALESCE(SUM(total_cost_usd), 0)::text AS total_cost_usd
      FROM token_usage
      WHERE user_id = $1
      `,
      [userId]
    );

    const row = result.rows[0];

    return {
      requests_count: Number(row?.requests_count ?? 0),
      prompt_tokens: Number(row?.prompt_tokens ?? 0),
      completion_tokens: Number(row?.completion_tokens ?? 0),
      total_cost_usd: Number(row?.total_cost_usd ?? 0)
    };
  }

  private validateInput(data: Record<string, unknown>): void {
    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Flow input must be a valid object');
    }

    const serialized = JSON.stringify(data);
    if (serialized.length > 20000) {
      throw new BadRequestException('Input payload too large');
    }
  }

  private async resolveFlow(flowName: string, flowVersion?: string): Promise<FlowDefinition> {
    if (flowVersion) {
      const dbFlow = await this.postgres.query<{
        flow_name: string;
        flow_version: string;
        prompt_version: string;
        output_schema_json: Record<string, unknown>;
      }>(
        `
        SELECT flow_name, flow_version, prompt_version, output_schema_json
        FROM ai_flows
        WHERE flow_name = $1
          AND flow_version = $2
          AND is_active = TRUE
        LIMIT 1
        `,
        [flowName, flowVersion]
      );

      const fromDb = dbFlow.rows[0];
      if (fromDb) {
        return {
          flow_name: fromDb.flow_name,
          flow_version: fromDb.flow_version,
          prompt_version: fromDb.prompt_version,
          required_output_fields: Object.keys((fromDb.output_schema_json as Record<string, unknown>) ?? {})
        };
      }
    }

    const registry = this.flowRegistry[flowName];
    if (!registry) {
      throw new BadRequestException(`Flow '${flowName}' is not supported`);
    }

    return registry;
  }

  private validateFlowOutput(flow: FlowDefinition, output: Record<string, unknown>): { valid: boolean; missing: string[] } {
    const missing = flow.required_output_fields.filter((key) => !(key in output));
    return {
      valid: missing.length === 0,
      missing
    };
  }

  private async callModelWithFallback(flow: FlowDefinition, input: Record<string, unknown>): Promise<{
    output: Record<string, unknown>;
    confidence: number;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalCostUsd: number;
    fallbackUsed: boolean;
  }> {
    try {
      const output = this.mockPrimaryModel(flow, input);
      return {
        output,
        confidence: 0.86,
        model: 'gpt-primary',
        promptTokens: 950,
        completionTokens: 420,
        totalCostUsd: 0.0124,
        fallbackUsed: false
      };
    } catch {
      const output = this.mockFallbackModel(flow, input);
      return {
        output,
        confidence: 0.68,
        model: 'gpt-fallback',
        promptTokens: 650,
        completionTokens: 330,
        totalCostUsd: 0.0062,
        fallbackUsed: true
      };
    }
  }

  private mockPrimaryModel(flow: FlowDefinition, input: Record<string, unknown>): Record<string, unknown> {
    if (flow.flow_name === 'resume_analysis') {
      return {
        summary: 'Resume shows strong technical foundation and project depth.',
        strengths: ['problem solving', 'typescript', 'backend fundamentals'],
        gaps: ['system design interviews', 'cloud certifications']
      };
    }

    if (flow.flow_name === 'skill_gap_analysis') {
      return {
        current_skills: input['current_skills'] ?? [],
        missing_skills: ['architecture', 'testing strategy', 'scalability patterns'],
        priority_order: ['testing strategy', 'architecture', 'scalability patterns']
      };
    }

    if (flow.flow_name === 'roadmap_generator') {
      return {
        stages: ['Foundation', 'Intermediate', 'Portfolio', 'Interview readiness'],
        timeline_weeks: 20,
        recommended_courses: ['backend fundamentals', 'distributed systems', 'cloud deployment']
      };
    }

    if (flow.flow_name === 'interview_simulation') {
      return {
        questions: ['Explain CAP theorem tradeoffs', 'Design a rate limiter'],
        feedback: ['Good structure, improve tradeoff depth'],
        score: 78
      };
    }

    return {
      observations: ['Learning time is consistent but fragmented.'],
      recommendations: ['Use 90-minute focused blocks', 'Add weekly retrospective'],
      next_week_plan: ['3 deep work sessions', '1 mock interview']
    };
  }

  private mockFallbackModel(flow: FlowDefinition, input: Record<string, unknown>): Record<string, unknown> {
    const base: Record<string, unknown> = {
      flow: flow.flow_name,
      input_received: Object.keys(input)
    };

    for (const field of flow.required_output_fields) {
      base[field] = [];
    }

    return base;
  }

  private buildEnvelope<T>(eventType: string, tenantId: string, userId: string, payload: T): EventEnvelope<T> {
    return {
      event_id: uuidv4(),
      event_type: eventType,
      event_version: 1,
      occurred_at: new Date().toISOString(),
      source: 'ai-core-service',
      tenant_id: tenantId,
      user_id: userId,
      payload
    };
  }
}
