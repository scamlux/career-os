import { createHash } from 'crypto';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { EventEnvelope, KafkaProducerService, PostgresService } from '@careeros/shared';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type UserRecord = {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string;
};

type AccessPayload = JwtPayload & {
  sub: string;
  tenant_id: string;
  roles: string[];
};

@Injectable()
export class AuthDomainService {
  private readonly logger = new Logger(AuthDomainService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly postgres: PostgresService,
    private readonly kafka: KafkaProducerService
  ) {}

  async register(email: string, password: string, tenantId?: string): Promise<{ userId: string; tenantId: string; tokens: AuthTokens }> {
    const normalizedEmail = email.trim().toLowerCase();
    const userId = uuidv4();
    const resolvedTenantId = tenantId ?? uuidv4();

    const passwordHash = this.hashValue(password);

    await this.postgres.query(
      `
      INSERT INTO users (id, tenant_id, email, password_hash)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      `,
      [userId, resolvedTenantId, normalizedEmail, passwordHash]
    );

    const user = await this.getUserByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedException('Unable to create user');
    }

    const tokens = this.generateTokens(user.id, user.tenant_id, ['STUDENT']);
    await this.createSession(user.id, tokens.refreshToken);

    await this.publishBestEffort(
      'careeros.auth.user-registered.v1',
      this.buildEnvelope('UserRegistered', user.tenant_id, user.id, {
        user_id: user.id,
        email: user.email,
        registered_at: new Date().toISOString(),
        default_role: 'STUDENT'
      })
    );

    return {
      userId: user.id,
      tenantId: user.tenant_id,
      tokens
    };
  }

  async login(email: string, password: string): Promise<{ userId: string; tenantId: string; tokens: AuthTokens }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.getUserByEmail(normalizedEmail);

    if (!user || this.hashValue(password) !== user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.tenant_id, ['STUDENT']);
    await this.createSession(user.id, tokens.refreshToken);

    await this.publishBestEffort(
      'careeros.auth.user-logged-in.v1',
      this.buildEnvelope('UserLoggedIn', user.tenant_id, user.id, {
        user_id: user.id,
        email: user.email,
        logged_in_at: new Date().toISOString()
      })
    );

    return {
      userId: user.id,
      tenantId: user.tenant_id,
      tokens
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = verify(refreshToken, this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')) as AccessPayload;
    const userId = payload.sub;

    const session = await this.postgres.query<{ id: string }>(
      `
      SELECT id
      FROM sessions
      WHERE user_id = $1
        AND refresh_token_hash = $2
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
      `,
      [userId, this.hashValue(refreshToken)]
    );

    if (!session.rowCount) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.generateTokens(payload.sub, payload.tenant_id, payload.roles ?? ['STUDENT']);
    await this.createSession(payload.sub, tokens.refreshToken);

    return tokens;
  }

  validateAccessToken(token: string): { valid: boolean; user_id?: string; tenant_id?: string; roles?: string[] } {
    try {
      const payload = verify(token, this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')) as AccessPayload;
      return {
        valid: true,
        user_id: payload.sub,
        tenant_id: payload.tenant_id,
        roles: payload.roles ?? ['STUDENT']
      };
    } catch {
      return { valid: false };
    }
  }

  async getPermissions(userId: string): Promise<string[]> {
    const rolesResult = await this.postgres.query<{ role: string }>(
      `
      SELECT r.code AS role
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = $1
      `,
      [userId]
    );

    const roles = rolesResult.rows.map((row: { role: string }) => row.role);
    if (!roles.length) {
      return ['roadmap:read', 'ai:execute:basic', 'lms:enroll'];
    }

    if (roles.includes('ADMIN')) {
      return ['*'];
    }

    if (roles.includes('INSTRUCTOR')) {
      return ['lms:course:create', 'lms:course:edit', 'lms:analytics:read'];
    }

    return ['roadmap:read', 'roadmap:update', 'ai:execute:basic', 'lms:enroll'];
  }

  private async getUserByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.postgres.query<UserRecord>(
      `
      SELECT id, tenant_id, email, password_hash
      FROM users
      WHERE email = $1 AND deleted_at IS NULL
      LIMIT 1
      `,
      [email]
    );

    return result.rows[0] ?? null;
  }

  private async createSession(userId: string, refreshToken: string): Promise<void> {
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + this.parseDurationToMs(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN')));

    await this.postgres.query(
      `
      INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at)
      VALUES ($1, $2, $3, $4)
      `,
      [id, userId, this.hashValue(refreshToken), expiresAt.toISOString()]
    );
  }

  private generateTokens(userId: string, tenantId: string, roles: string[]): AuthTokens {
    const accessTokenExpiresInSeconds = this.parseDurationToSeconds(
      this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN')
    );
    const refreshTokenExpiresInSeconds = this.parseDurationToSeconds(
      this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN')
    );

    const accessToken = sign(
      {
        sub: userId,
        tenant_id: tenantId,
        roles
      },
      this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      { expiresIn: accessTokenExpiresInSeconds }
    );

    const refreshToken = sign(
      {
        sub: userId,
        tenant_id: tenantId,
        roles
      },
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      { expiresIn: refreshTokenExpiresInSeconds }
    );

    return { accessToken, refreshToken };
  }

  private hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private parseDurationToMs(input: string): number {
    const unit = input.slice(-1);
    const value = Number(input.slice(0, -1));

    if (!Number.isFinite(value)) {
      return 30 * 24 * 60 * 60 * 1000;
    }

    if (unit === 'm') {
      return value * 60 * 1000;
    }

    if (unit === 'h') {
      return value * 60 * 60 * 1000;
    }

    if (unit === 'd') {
      return value * 24 * 60 * 60 * 1000;
    }

    return 30 * 24 * 60 * 60 * 1000;
  }

  private parseDurationToSeconds(input: string): number {
    return Math.floor(this.parseDurationToMs(input) / 1000);
  }

  private buildEnvelope<T>(eventType: string, tenantId: string, userId: string, payload: T): EventEnvelope<T> {
    return {
      event_id: uuidv4(),
      event_type: eventType,
      event_version: 1,
      occurred_at: new Date().toISOString(),
      source: 'auth-service',
      tenant_id: tenantId,
      user_id: userId,
      payload
    };
  }

  private async publishBestEffort<T>(topic: string, envelope: EventEnvelope<T>): Promise<void> {
    try {
      await this.kafka.publish(topic, envelope);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown kafka publish error';
      this.logger.warn(`Kafka publish skipped for ${topic}: ${message}`);
    }
  }
}
