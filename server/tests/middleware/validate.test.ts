import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { AppError } from '../../src/lib/app-error.js';
import { VALIDATED_QUERY_KEY, validateBody, validateQuery } from '../../src/middleware/validate.js';

function run(
  handler: ReturnType<typeof validateBody>,
  req: Partial<Request>,
): { next: ReturnType<typeof vi.fn>; res: Response } {
  const next = vi.fn();
  const res = { locals: {} } as unknown as Response;
  handler(req as Request, res, next as NextFunction);
  return { next, res };
}

describe('validateBody', () => {
  const schema = z.object({ question: z.string().min(1) }).strict();

  it('replaces req.body with the parsed, typed output', () => {
    const req = { body: { question: 'Where is Gate 6?' } };
    const { next } = run(validateBody(schema), req);
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ question: 'Where is Gate 6?' });
  });

  it('forwards a 400 AppError naming the failing field', () => {
    const { next } = run(validateBody(schema), { body: { question: '' } });
    const forwarded = (next.mock.calls[0] as unknown[])[0] as AppError;
    expect(forwarded).toBeInstanceOf(AppError);
    expect(forwarded.statusCode).toBe(400);
    expect(forwarded.message).toContain('question');
  });

  it('falls back to a generic message when the schema reports no issues', () => {
    // A zod refinement can fail while contributing no issue entries; the
    // middleware must still produce a client-safe 400 rather than crash.
    const issuelessSchema = {
      safeParse: () => ({ success: false as const, error: { issues: [] } }),
    } as unknown as z.ZodTypeAny;
    const { next } = run(validateBody(issuelessSchema), { body: {} });
    const forwarded = (next.mock.calls[0] as unknown[])[0] as AppError;
    expect(forwarded.statusCode).toBe(400);
    expect(forwarded.message).toBe('Invalid request');
  });

  it('uses the bare issue message when the issue has no path', () => {
    const rootIssueSchema = z.unknown().refine(() => false, { message: 'root rejected' });
    const { next } = run(validateBody(rootIssueSchema), { body: {} });
    const forwarded = (next.mock.calls[0] as unknown[])[0] as AppError;
    expect(forwarded.message).toBe('root rejected');
  });
});

describe('validateQuery', () => {
  const schema = z.object({ category: z.string().optional() }).strict();

  it('stores the parsed query on res.locals for the route handler', () => {
    const { next, res } = run(validateQuery(schema), { query: { category: 'dining' } });
    expect(next).toHaveBeenCalledWith();
    expect(res.locals[VALIDATED_QUERY_KEY]).toEqual({ category: 'dining' });
  });

  it('forwards a 400 AppError for unknown query keys', () => {
    const { next } = run(validateQuery(schema), { query: { admin: 'true' } });
    const forwarded = (next.mock.calls[0] as unknown[])[0] as AppError;
    expect(forwarded).toBeInstanceOf(AppError);
    expect(forwarded.statusCode).toBe(400);
  });
});
