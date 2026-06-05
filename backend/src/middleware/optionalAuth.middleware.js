/**
 * Middleware: Optional authentication.
 * Attaches user to req if session exists, but continues either way.
 * Used for endpoints that work for both guests and logged-in users.
 */
export const optionalAuth = (req, res, next) => {
  // Passport already attaches req.user if session exists
  // This middleware just ensures the request always continues
  next();
};
