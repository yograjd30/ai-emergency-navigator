/**
 * Middleware: Requires authenticated session.
 * Returns 401 if user is not logged in.
 */
export const requireAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: 'Authentication required. Please log in.',
    code: 401,
  });
};
