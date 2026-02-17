import { Controller, Get, Param } from '@nestjs/common';
import { EduTrackerDomainService } from '../domain/edu-tracker.domain.service';

@Controller('edu-tracker')
export class EduTrackerController {
  constructor(private readonly trackerDomainService: EduTrackerDomainService) {}

  @Get('progress/:userId')
  async getProgress(@Param('userId') userId: string) {
    return this.trackerDomainService.getLearningProgress(userId);
  }
}
