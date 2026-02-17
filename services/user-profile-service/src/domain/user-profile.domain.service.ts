import { Injectable } from '@nestjs/common';
import { EventEnvelope, KafkaProducerService, PostgresService } from '@careeros/shared';
import { v4 as uuidv4 } from 'uuid';
import { UpsertProfileDto } from '../dto/upsert-profile.dto';

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  title: string | null;
  location: string | null;
  bio: string | null;
};

type SkillScoreRow = {
  skill_key: string;
  score: number;
};

@Injectable()
export class UserProfileDomainService {
  constructor(
    private readonly postgres: PostgresService,
    private readonly kafka: KafkaProducerService
  ) {}

  async getProfile(userId: string): Promise<{ user_id: string; full_name: string; title: string; location: string; bio: string }> {
    const result = await this.postgres.query<ProfileRow>(
      `
      SELECT user_id, full_name, title, location, bio
      FROM profiles
      WHERE user_id = $1 AND deleted_at IS NULL
      LIMIT 1
      `,
      [userId]
    );

    const profile = result.rows[0];

    if (!profile) {
      return {
        user_id: userId,
        full_name: '',
        title: '',
        location: '',
        bio: ''
      };
    }

    return {
      user_id: profile.user_id,
      full_name: profile.full_name ?? '',
      title: profile.title ?? '',
      location: profile.location ?? '',
      bio: profile.bio ?? ''
    };
  }

  async upsertProfile(userId: string, tenantId: string, dto: UpsertProfileDto): Promise<void> {
    await this.postgres.query(
      `
      INSERT INTO profiles (id, user_id, tenant_id, full_name, title, location, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          title = EXCLUDED.title,
          location = EXCLUDED.location,
          bio = EXCLUDED.bio,
          updated_at = NOW()
      `,
      [uuidv4(), userId, tenantId, dto.fullName ?? null, dto.title ?? null, dto.location ?? null, dto.bio ?? null]
    );

    await this.kafka.publish(
      'careeros.profile.profile-updated.v1',
      this.buildEnvelope('ProfileUpdated', tenantId, userId, {
        user_id: userId,
        updated_fields: Object.keys(dto)
      })
    );
  }

  async upsertSkill(userId: string, tenantId: string, skillKey: string, skillName: string, proficiency: number): Promise<void> {
    const skill = await this.postgres.query<{ id: string }>(
      `
      SELECT id
      FROM skills
      WHERE key = $1
      LIMIT 1
      `,
      [skillKey]
    );

    let skillId = skill.rows[0]?.id;
    if (!skillId) {
      skillId = uuidv4();
      await this.postgres.query(
        `
        INSERT INTO skills (id, key, name)
        VALUES ($1, $2, $3)
        `,
        [skillId, skillKey, skillName]
      );
    }

    await this.postgres.query(
      `
      INSERT INTO user_skills (user_id, skill_id, proficiency, evidence_count)
      VALUES ($1, $2, $3, 0)
      ON CONFLICT (user_id, skill_id) DO UPDATE
      SET proficiency = EXCLUDED.proficiency,
          updated_at = NOW()
      `,
      [userId, skillId, proficiency]
    );

    await this.kafka.publish(
      'careeros.profile.skills-updated.v1',
      this.buildEnvelope('SkillsUpdated', tenantId, userId, {
        user_id: userId,
        skill_key: skillKey,
        proficiency
      })
    );
  }

  async getSkillMatrix(userId: string): Promise<Array<{ skill_key: string; score: number }>> {
    const result = await this.postgres.query<SkillScoreRow>(
      `
      SELECT s.key AS skill_key, us.proficiency AS score
      FROM user_skills us
      JOIN skills s ON s.id = us.skill_id
      WHERE us.user_id = $1
      ORDER BY us.updated_at DESC
      LIMIT 100
      `,
      [userId]
    );

    return result.rows;
  }

  private buildEnvelope<T>(eventType: string, tenantId: string, userId: string, payload: T): EventEnvelope<T> {
    return {
      event_id: uuidv4(),
      event_type: eventType,
      event_version: 1,
      occurred_at: new Date().toISOString(),
      source: 'user-profile-service',
      tenant_id: tenantId,
      user_id: userId,
      payload
    };
  }
}
