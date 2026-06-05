import { Router } from 'express';
import { googleLogin, googleCallback, googleCallbackRedirect, getMe, logout } from '../controllers/auth.controller.js';

const router = Router();

// GET /api/auth/google — Initiate Google OAuth
router.get('/google', googleLogin);

// GET /api/auth/google/callback — OAuth callback
router.get('/google/callback', googleCallback, googleCallbackRedirect);

// GET /api/auth/me — Current user (or null)
router.get('/me', getMe);

// POST /api/auth/logout — Destroy session
router.post('/logout', logout);

export default router;
