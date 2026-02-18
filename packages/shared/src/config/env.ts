import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  LOG_LEVEL: Joi.string().default('info'),
  HTTP_PORT: Joi.number().port().default(8080),
  GRPC_PORT: Joi.number().port().default(50051),
  DATABASE_URL: Joi.string().uri().required(),
  KAFKA_BROKERS: Joi.string().required(),
  KAFKA_CLIENT_ID: Joi.string().default('careeros'),
  REDIS_URL: Joi.string().uri().optional(),
  SERVICE_SHARED_SECRET: Joi.string().min(8).required(),
  THROTTLE_TTL: Joi.number().integer().positive().default(60),
  THROTTLE_LIMIT: Joi.number().integer().positive().default(120),
  JWT_ACCESS_SECRET: Joi.string().min(16).default('dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: Joi.string().min(16).default('dev-refresh-secret-change-me'),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  AUTH_GRPC_URL: Joi.string().default('localhost:6001'),
  USER_PROFILE_GRPC_URL: Joi.string().default('localhost:6002'),
  AI_CORE_GRPC_URL: Joi.string().default('localhost:6003'),
  ROADMAP_GRPC_URL: Joi.string().default('localhost:6004'),
  LMS_GRPC_URL: Joi.string().default('localhost:6005'),
  EDU_TRACKER_GRPC_URL: Joi.string().default('localhost:6006'),
  BILLING_GRPC_URL: Joi.string().default('localhost:6007'),
  ANALYTICS_GRPC_URL: Joi.string().default('localhost:6008'),
  OPENAI_API_KEY: Joi.string().optional(),
  OPENAI_MODEL: Joi.string().default('gpt-4o-mini')
});

export type CommonEnv = {
  NODE_ENV: 'development' | 'test' | 'production';
  LOG_LEVEL: string;
  HTTP_PORT: number;
  GRPC_PORT: number;
  DATABASE_URL: string;
  KAFKA_BROKERS: string;
  KAFKA_CLIENT_ID: string;
  REDIS_URL?: string;
  SERVICE_SHARED_SECRET: string;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  AUTH_GRPC_URL: string;
  USER_PROFILE_GRPC_URL: string;
  AI_CORE_GRPC_URL: string;
  ROADMAP_GRPC_URL: string;
  LMS_GRPC_URL: string;
  EDU_TRACKER_GRPC_URL: string;
  BILLING_GRPC_URL: string;
  ANALYTICS_GRPC_URL: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
};
