import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rateLimit.js';
import { getProfile, updateProfile } from '../controllers/user.controller.js';

const router = Router();

// GET /api/users/me — Full profile (auth required)
router.get('/me', requireAuth, getProfile);

// PATCH /api/users/me — Update profile (auth required)
router.patch('/me', requireAuth, generalLimiter, updateProfile);

export default router;
