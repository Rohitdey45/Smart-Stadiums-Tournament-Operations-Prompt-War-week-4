// Request validation at the trust boundary: every body/query is parsed with
// a strict zod schema before feature logic runs.
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';

import { AppError } from '../lib/app-error.js';

/** res.locals key under which validated query params are stored. */
export const VALIDATED_QUERY_KEY = 'validatedQuery';

function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return 'Invalid request';
  }
  const path = issue.path.join('.');
  return path === '' ? issue.message : `${path}: ${issue.message}`;
}

/** Parses and replaces `req.body` with the schema's typed output, or 400s. */
export function validateBody(schema: z.ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(AppError.badRequest(firstIssue(result.error)));
      return;
    }
    req.body = result.data as unknown;
    next();
  };
}

/**
 * Parses `req.query` against the schema, storing the typed result on
 * `res.locals[VALIDATED_QUERY_KEY]` for the route handler to read back.
 */
export function validateQuery(schema: z.ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(AppError.badRequest(firstIssue(result.error)));
      return;
    }
    res.locals[VALIDATED_QUERY_KEY] = result.data as unknown;
    next();
  };
}
