import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'ai-core-service',
      timestamp: new Date().toISOString()
    };
  }
}
