export const supportedLocales = ['en', 'ru', 'es'] as const;

export type Locale = (typeof supportedLocales)[number];

export const dictionary: Record<Locale, Record<string, string>> = {
  en: { dashboard: 'Dashboard', ai_assistant: 'AI Assistant' },
  ru: { dashboard: 'Панель', ai_assistant: 'AI ассистент' },
  es: { dashboard: 'Panel', ai_assistant: 'Asistente IA' }
};
