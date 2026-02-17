import { Injectable } from '@nestjs/common';
import { EventEnvelope, KafkaProducerService, PostgresService } from '@careeros/shared';
import { v4 as uuidv4 } from 'uuid';

type CourseRow = {
  id: string;
  title: string;
  instructor_id: string;
  status: string;
};

type EnrollmentRow = {
  status: string;
};

@Injectable()
export class LmsDomainService {
  constructor(
    private readonly postgres: PostgresService,
    private readonly kafka: KafkaProducerService
  ) {}

  async createCourse(input: {
    instructorId: string;
    title: string;
    description?: string;
    priceUsd?: number;
  }): Promise<{ course_id: string; status: string }> {
    const courseId = uuidv4();

    await this.postgres.query(
      `
      INSERT INTO courses (id, instructor_id, title, description, price_usd, status)
      VALUES ($1, $2, $3, $4, $5, 'DRAFT')
      `,
      [courseId, input.instructorId, input.title, input.description ?? null, input.priceUsd ?? 0]
    );

    return {
      course_id: courseId,
      status: 'DRAFT'
    };
  }

  async publishCourse(courseId: string): Promise<void> {
    await this.postgres.query(
      `
      UPDATE courses
      SET status = 'PUBLISHED', published_at = NOW()
      WHERE id = $1
      `,
      [courseId]
    );
  }

  async enroll(input: { userId: string; courseId: string; tenantId: string }): Promise<void> {
    await this.postgres.query(
      `
      INSERT INTO enrollments (id, user_id, course_id, status)
      VALUES ($1, $2, $3, 'ACTIVE')
      ON CONFLICT (user_id, course_id) DO UPDATE
      SET status = 'ACTIVE'
      `,
      [uuidv4(), input.userId, input.courseId]
    );

    await this.kafka.publish(
      'careeros.lms.enrollment-created.v1',
      this.buildEnvelope('EnrollmentCreated', input.tenantId, input.userId, {
        user_id: input.userId,
        course_id: input.courseId
      })
    );
  }

  async completeLesson(input: {
    userId: string;
    tenantId: string;
    courseId: string;
    lessonId: string;
    timeSpentMinutes: number;
  }): Promise<void> {
    await this.kafka.publish(
      'careeros.lms.lesson-completed.v1',
      this.buildEnvelope('LessonCompleted', input.tenantId, input.userId, {
        lesson_id: input.lessonId,
        course_id: input.courseId,
        user_id: input.userId,
        completed_at: new Date().toISOString(),
        time_spent_minutes: input.timeSpentMinutes
      })
    );
  }

  async getCourse(courseId: string): Promise<{ course_id: string; title: string; instructor_id: string; is_published: boolean }> {
    const result = await this.postgres.query<CourseRow>(
      `
      SELECT id, title, instructor_id, status
      FROM courses
      WHERE id = $1
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [courseId]
    );

    const course = result.rows[0];
    if (!course) {
      return {
        course_id: '',
        title: '',
        instructor_id: '',
        is_published: false
      };
    }

    return {
      course_id: course.id,
      title: course.title,
      instructor_id: course.instructor_id,
      is_published: course.status === 'PUBLISHED'
    };
  }

  async getEnrollment(userId: string, courseId: string): Promise<{ enrolled: boolean; enrollment_status: string }> {
    const result = await this.postgres.query<EnrollmentRow>(
      `
      SELECT status
      FROM enrollments
      WHERE user_id = $1 AND course_id = $2
      LIMIT 1
      `,
      [userId, courseId]
    );

    const row = result.rows[0];

    if (!row) {
      return {
        enrolled: false,
        enrollment_status: 'NOT_ENROLLED'
      };
    }

    return {
      enrolled: row.status === 'ACTIVE',
      enrollment_status: row.status
    };
  }

  private buildEnvelope<T>(eventType: string, tenantId: string, userId: string, payload: T): EventEnvelope<T> {
    return {
      event_id: uuidv4(),
      event_type: eventType,
      event_version: 1,
      occurred_at: new Date().toISOString(),
      source: 'lms-service',
      tenant_id: tenantId,
      user_id: userId,
      payload
    };
  }
}
