import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rateLimit.js';
import { getSessions, getSessionById, updateSession, deleteSession } from '../controllers/session.controller.js';

const router = Router();

// All session routes require authentication
router.use(requireAuth);

// GET /api/sessions — User's session history
router.get('/', getSessions);

// GET /api/sessions/:id — Full session detail
router.get('/:id', getSessionById);

// PATCH /api/sessions/:id — Update bookmark/resolved
router.patch('/:id', generalLimiter, updateSession);

// DELETE /api/sessions/:id — Delete session
router.delete('/:id', generalLimiter, deleteSession);

export default router;
