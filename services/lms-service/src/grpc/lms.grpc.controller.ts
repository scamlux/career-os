import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LmsDomainService } from '../domain/lms.domain.service';

type GetCourseRequest = {
  course_id: string;
};

type GetEnrollmentRequest = {
  user_id: string;
  course_id: string;
};

@Controller()
export class LmsGrpcController {
  constructor(private readonly lmsDomainService: LmsDomainService) {}

  @GrpcMethod('LMSService', 'GetCourse')
  async getCourse(payload: GetCourseRequest) {
    return this.lmsDomainService.getCourse(payload.course_id);
  }

  @GrpcMethod('LMSService', 'GetEnrollment')
  async getEnrollment(payload: GetEnrollmentRequest) {
    return this.lmsDomainService.getEnrollment(payload.user_id, payload.course_id);
  }
}
