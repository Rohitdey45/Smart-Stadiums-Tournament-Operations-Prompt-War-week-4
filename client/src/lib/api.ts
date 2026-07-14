// Typed fetch wrapper. Every network call goes through here so error
// handling, JSON parsing, and response-shape validation are consistent
// across features: responses are checked at runtime with type guards —
// the same "parse, don't trust" rule the server applies to its inputs.
import type {
  ApiErrorBody,
  AssistantAnswer,
  OpsBriefing,
  OpsSnapshot,
  SupportedLanguage,
} from './api-types.js';

/** Error thrown for any non-2xx API response, carrying a display message. */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const GENERIC_ERROR = 'The service is temporarily unavailable. Please try again.';

/**
 * Extracts a user-safe message from a caught error: the sanitized message of
 * a known {@link ApiError}, otherwise the caller's fallback.
 */
export function toErrorMessage(caught: unknown, fallback: string): string {
  return caught instanceof ApiError ? caught.message : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  if (!isRecord(value) || !('error' in value)) {
    return false;
  }
  const { error } = value;
  return isRecord(error) && typeof error.message === 'string';
}

function isAssistantAnswer(value: unknown): value is AssistantAnswer {
  return (
    isRecord(value) &&
    typeof value.answer === 'string' &&
    typeof value.language === 'string' &&
    typeof value.cached === 'boolean'
  );
}

function isOpsSnapshot(value: unknown): value is OpsSnapshot {
  return (
    isRecord(value) &&
    Array.isArray(value.zones) &&
    Array.isArray(value.incidents) &&
    isRecord(value.sustainability) &&
    typeof value.generatedAt === 'string'
  );
}

function isOpsBriefing(value: unknown): value is OpsBriefing {
  return (
    isRecord(value) && typeof value.briefing === 'string' && typeof value.generatedAt === 'string'
  );
}

async function request<T>(
  path: string,
  validate: (value: unknown) => value is T,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    const mergedHeaders = new Headers();
    mergedHeaders.set('Content-Type', 'application/json');
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => {
        mergedHeaders.set(key, value);
      });
    }
    response = await fetch(path, {
      ...init,
      headers: mergedHeaders,
    });
  } catch {
    throw new ApiError('NETWORK', GENERIC_ERROR);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const { code, message } = isErrorBody(payload)
      ? payload.error
      : { code: 'UNKNOWN', message: GENERIC_ERROR };
    throw new ApiError(code, message);
  }
  if (!validate(payload)) {
    throw new ApiError('MALFORMED', GENERIC_ERROR);
  }
  return payload;
}

/** Asks the fan assistant a grounded question in the given language. */
export function askAssistant(
  question: string,
  language: SupportedLanguage,
): Promise<AssistantAnswer> {
  return request('/api/assistant/ask', isAssistantAnswer, {
    method: 'POST',
    body: JSON.stringify({ question, language }),
  });
}

/** Fetches the current operations snapshot. */
export function fetchSnapshot(): Promise<OpsSnapshot> {
  return request('/api/operations/snapshot', isOpsSnapshot);
}

/** Requests a freshly generated AI operations briefing. */
export function requestBriefing(): Promise<OpsBriefing> {
  return request('/api/operations/briefing', isOpsBriefing, { method: 'POST' });
}
