import { Router } from 'express';
import { nearbyLimiter } from '../middleware/rateLimit.js';
import { getNearbyServices } from '../controllers/nearby.controller.js';

const router = Router();

// GET /api/nearby — Nearby emergency services
router.get('/', nearbyLimiter, getNearbyServices);

export default router;
