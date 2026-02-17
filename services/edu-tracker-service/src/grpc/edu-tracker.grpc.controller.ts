import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EduTrackerDomainService } from '../domain/edu-tracker.domain.service';

type GetLearningProgressRequest = {
  user_id: string;
};

@Controller()
export class EduTrackerGrpcController {
  constructor(private readonly trackerDomainService: EduTrackerDomainService) {}

  @GrpcMethod('EduTrackerService', 'GetLearningProgress')
  async getLearningProgress(payload: GetLearningProgressRequest) {
    return this.trackerDomainService.getLearningProgress(payload.user_id);
  }
}
