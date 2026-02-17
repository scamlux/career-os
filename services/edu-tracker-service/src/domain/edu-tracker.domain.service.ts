import { Injectable } from '@nestjs/common';
import { PostgresService } from '@careeros/shared';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EduTrackerDomainService {
  constructor(private readonly postgres: PostgresService) {}

  async ingestLessonCompleted(input: {
    eventId: string;
    userId: string;
    courseId: string;
    lessonId: string;
    timeSpentMinutes: number;
  }): Promise<void> {
    await this.postgres.query(
      `
      INSERT INTO progress_logs (id, user_id, source_event_type, source_event_id, metric_key, metric_value)
      VALUES ($1, $2, 'LessonCompleted', $3, 'time_spent_minutes', $4)
      ON CONFLICT (source_event_id, metric_key) DO NOTHING
      `,
      [uuidv4(), input.userId, input.eventId, input.timeSpentMinutes]
    );

    await this.recomputeProductivity(input.userId);
    await this.recomputeMastery(input.userId, `course:${input.courseId}`);
  }

  async ingestMilestoneCompleted(input: {
    eventId: string;
    userId: string;
    milestoneId: string;
  }): Promise<void> {
    await this.postgres.query(
      `
      INSERT INTO progress_logs (id, user_id, source_event_type, source_event_id, metric_key, metric_value)
      VALUES ($1, $2, 'MilestoneCompleted', $3, 'milestone_completed', 1)
      ON CONFLICT (source_event_id, metric_key) DO NOTHING
      `,
      [uuidv4(), input.userId, input.eventId]
    );

    await this.recomputeProductivity(input.userId);
    await this.recomputeMastery(input.userId, `milestone:${input.milestoneId}`);
  }

  async getLearningProgress(userId: string): Promise<{
    mastery_score: number;
    streak_days: number;
    minutes_this_week: number;
    productivity_score: number;
  }> {
    const mastery = await this.postgres.query<{ avg_score: string }>(
      `
      SELECT COALESCE(AVG(score), 0)::text AS avg_score
      FROM mastery_scores
      WHERE user_id = $1
      `,
      [userId]
    );

    const productivity = await this.postgres.query<{
      streak_days: number;
      weekly_minutes: number;
      productivity_score: string;
    }>(
      `
      SELECT streak_days, weekly_minutes, productivity_score::text AS productivity_score
      FROM productivity_metrics
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    const productivityRow = productivity.rows[0];

    return {
      mastery_score: Number(mastery.rows[0]?.avg_score ?? 0),
      streak_days: productivityRow?.streak_days ?? 0,
      minutes_this_week: productivityRow?.weekly_minutes ?? 0,
      productivity_score: Number(productivityRow?.productivity_score ?? 0)
    };
  }

  private async recomputeMastery(userId: string, skillKey: string): Promise<void> {
    const rolling = await this.postgres.query<{ total_minutes: string }>(
      `
      SELECT COALESCE(SUM(metric_value), 0)::text AS total_minutes
      FROM progress_logs
      WHERE user_id = $1
        AND metric_key = 'time_spent_minutes'
        AND recorded_at >= NOW() - INTERVAL '30 days'
      `,
      [userId]
    );

    const totalMinutes = Number(rolling.rows[0]?.total_minutes ?? 0);
    const score = Math.min(100, Math.round(totalMinutes / 12));

    await this.postgres.query(
      `
      INSERT INTO mastery_scores (id, user_id, skill_key, score)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, skill_key) DO UPDATE
      SET score = EXCLUDED.score,
          computed_at = NOW()
      `,
      [uuidv4(), userId, skillKey, score]
    );
  }

  private async recomputeProductivity(userId: string): Promise<void> {
    const weekly = await this.postgres.query<{ total_minutes: string }>(
      `
      SELECT COALESCE(SUM(metric_value), 0)::text AS total_minutes
      FROM progress_logs
      WHERE user_id = $1
        AND metric_key = 'time_spent_minutes'
        AND recorded_at >= NOW() - INTERVAL '7 days'
      `,
      [userId]
    );

    const streak = await this.postgres.query<{ active_days: string }>(
      `
      SELECT COUNT(DISTINCT DATE(recorded_at))::text AS active_days
      FROM progress_logs
      WHERE user_id = $1
        AND recorded_at >= NOW() - INTERVAL '30 days'
      `,
      [userId]
    );

    const weeklyMinutes = Number(weekly.rows[0]?.total_minutes ?? 0);
    const streakDays = Number(streak.rows[0]?.active_days ?? 0);
    const productivityScore = Math.min(100, Math.round(weeklyMinutes * 0.4 + streakDays * 2));

    await this.postgres.query(
      `
      INSERT INTO productivity_metrics (id, user_id, streak_days, weekly_minutes, productivity_score, prediction_json)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      ON CONFLICT (user_id) DO UPDATE
      SET streak_days = EXCLUDED.streak_days,
          weekly_minutes = EXCLUDED.weekly_minutes,
          productivity_score = EXCLUDED.productivity_score,
          prediction_json = EXCLUDED.prediction_json,
          computed_at = NOW()
      `,
      [
        uuidv4(),
        userId,
        streakDays,
        weeklyMinutes,
        productivityScore,
        JSON.stringify({
          burnout_risk: weeklyMinutes > 800 ? 0.7 : 0.2,
          completion_probability: Math.min(0.95, 0.35 + weeklyMinutes / 1200)
        })
      ]
    );
  }
}
