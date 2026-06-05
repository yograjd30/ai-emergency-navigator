import { Router } from 'express';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { triageEmergency, followUp } from '../controllers/triage.controller.js';

const router = Router();

// POST /api/triage — Classify emergency
router.post('/', optionalAuth, aiLimiter, triageEmergency);

// POST /api/triage/:sessionId/followup — Follow-up in conversation
router.post('/:sessionId/followup', optionalAuth, aiLimiter, followUp);

export default router;
