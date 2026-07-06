// Domain types for the multilingual fan assistant.

/** Languages the assistant answers in (FIFA World Cup 2026 host + top fan languages). */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'pt' | 'ar';

/** A grounded answer returned to the client. */
export interface AssistantAnswer {
  answer: string;
  language: SupportedLanguage;
  cached: boolean;
}
