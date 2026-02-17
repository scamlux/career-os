export type MicroFrontendSlot = {
  name: string;
  routePrefix: string;
  enabled: boolean;
};

export const microFrontendSlots: MicroFrontendSlot[] = [
  { name: 'career-ai', routePrefix: '/app/ai-assistant', enabled: true },
  { name: 'learning-lms', routePrefix: '/app/courses', enabled: true },
  { name: 'enterprise-admin', routePrefix: '/organization', enabled: true }
];
