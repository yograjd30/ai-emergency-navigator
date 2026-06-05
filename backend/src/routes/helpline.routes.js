import { Router } from 'express';
import { getHelplines, getEmergencyHelplines } from '../controllers/helpline.controller.js';

const router = Router();

// GET /api/helplines — All helplines (filtered)
router.get('/', getHelplines);

// GET /api/helplines/emergency — Top emergency numbers
router.get('/emergency', getEmergencyHelplines);

export default router;
