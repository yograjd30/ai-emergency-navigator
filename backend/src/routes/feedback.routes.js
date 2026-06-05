import { Router } from 'express';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';
import { feedbackLimiter } from '../middleware/rateLimit.js';
import { submitFeedback } from '../controllers/feedback.controller.js';

const router = Router();

// POST /api/feedback — Submit feedback
router.post('/', optionalAuth, feedbackLimiter, submitFeedback);

export default router;
