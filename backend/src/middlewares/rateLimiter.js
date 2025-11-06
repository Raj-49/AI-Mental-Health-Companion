const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication routes
 * Limits: 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false, // Count all requests
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * Rate limiter for password reset requests
 * Limits: 3 requests per hour per IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    error: 'Too many password reset attempts. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many password reset requests. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

module.exports = {
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
};
