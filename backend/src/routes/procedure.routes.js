import { Router } from 'express';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { getProcedures, getProcedureById, adaptProcedure } from '../controllers/procedure.controller.js';

const router = Router();

// GET /api/procedures — List procedures
router.get('/', getProcedures);

// GET /api/procedures/:id — Procedure detail
router.get('/:id', getProcedureById);

// POST /api/procedures/:id/adapt — AI-adapt procedure
router.post('/:id/adapt', optionalAuth, aiLimiter, adaptProcedure);

export default router;
