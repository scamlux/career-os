import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'user-profile-service',
      timestamp: new Date().toISOString()
    };
  }
}
