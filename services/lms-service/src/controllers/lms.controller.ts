import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LmsDomainService } from '../domain/lms.domain.service';
import { CompleteLessonDto } from '../dto/complete-lesson.dto';
import { CreateCourseDto } from '../dto/create-course.dto';
import { EnrollDto } from '../dto/enroll.dto';

@Controller('lms')
export class LmsController {
  constructor(private readonly lmsDomainService: LmsDomainService) {}

  @Post('courses')
  async createCourse(@Body() dto: CreateCourseDto) {
    return this.lmsDomainService.createCourse({
      instructorId: dto.instructorId,
      title: dto.title,
      description: dto.description,
      priceUsd: dto.priceUsd
    });
  }

  @Patch('courses/:courseId/publish')
  async publishCourse(@Param('courseId') courseId: string) {
    await this.lmsDomainService.publishCourse(courseId);
    return { ok: true };
  }

  @Post('enrollments')
  async enroll(@Body() dto: EnrollDto) {
    await this.lmsDomainService.enroll({
      userId: dto.userId,
      courseId: dto.courseId,
      tenantId: dto.tenantId
    });

    return { ok: true };
  }

  @Post('lessons/complete')
  async completeLesson(@Body() dto: CompleteLessonDto) {
    await this.lmsDomainService.completeLesson({
      userId: dto.userId,
      tenantId: dto.tenantId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
      timeSpentMinutes: dto.timeSpentMinutes
    });

    return { ok: true };
  }

  @Get('courses/:courseId')
  async getCourse(@Param('courseId') courseId: string) {
    return this.lmsDomainService.getCourse(courseId);
  }
}
