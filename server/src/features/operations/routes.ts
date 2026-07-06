// HTTP surface of the operations feature.
import { Router } from 'express';

import { genAiLimiter } from '../../middleware/rate-limit.js';
import { generateBriefing } from './briefing.js';
import { getSnapshot } from './service.js';

/** Router mounted at /api/operations. */
export const operationsRoutes: Router = Router();

operationsRoutes.get('/snapshot', (_req, res, next) => {
  getSnapshot()
    .then((snapshot) => res.json(snapshot))
    .catch((error: unknown) => {
      next(error);
    });
});

operationsRoutes.post('/briefing', genAiLimiter, (_req, res, next) => {
  generateBriefing()
    .then((briefing) => res.json(briefing))
    .catch((error: unknown) => {
      next(error);
    });
});
