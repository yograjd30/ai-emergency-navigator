import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for standard POST/PUT/DELETE routes.
 * 100 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    code: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for AI endpoints (triage, procedure adaptation).
 * 10 requests per minute per IP.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'AI request limit reached. Please wait a moment before trying again.',
    code: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Feedback rate limiter.
 * 3 requests per minute per IP.
 */
export const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: 'Feedback rate limit reached. Please wait before submitting again.',
    code: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Nearby services rate limiter.
 * 5 requests per minute per IP.
 */
export const nearbyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many nearby service requests. Please wait.',
    code: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
