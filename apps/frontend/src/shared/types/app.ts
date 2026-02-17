export type AsyncState = 'idle' | 'loading' | 'success' | 'error';

export type TimeRange = '7d' | '30d' | '90d';

export type ServiceKey =
  | 'gateway'
  | 'auth'
  | 'profile'
  | 'ai_core'
  | 'roadmap'
  | 'lms'
  | 'edu_tracker'
  | 'billing'
  | 'analytics';
