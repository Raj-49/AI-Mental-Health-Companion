import rateLimit from 'express-rate-limit';

// Read env toggles so we can temporarily disable or relax limits
const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED !== 'false'; // default true
const AUTH_MAX = parseInt(process.env.AUTH_MAX_REQUESTS || '5', 10);
const AUTH_WINDOW_MS = parseInt(process.env.AUTH_WINDOW_MS || String(15 * 60 * 1000), 10);
const RESET_MAX = parseInt(process.env.RESET_MAX_REQUESTS || '3', 10);
const RESET_WINDOW_MS = parseInt(process.env.RESET_WINDOW_MS || String(60 * 60 * 1000), 10);
const API_MAX = parseInt(process.env.API_MAX_REQUESTS || '100', 10);
const API_WINDOW_MS = parseInt(process.env.API_WINDOW_MS || String(15 * 60 * 1000), 10);

// Helper: return a passthrough middleware if rate limiting is disabled
const passthrough = (req, res, next) => next();

const createLimiter = (opts) => {
  if (!RATE_LIMIT_ENABLED) return passthrough;
  return rateLimit(opts);
};

/**
 * Rate limiter for authentication routes
 * Default: 5 requests per 15 minutes per IP
 */
const authLimiter = createLimiter({
  windowMs: AUTH_WINDOW_MS,
  max: AUTH_MAX,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts from this IP. Please try again later.',
      retryAfter: req.rateLimit ? Math.ceil(req.rateLimit.resetTime / 1000) : undefined,
    });
  },
});

/**
 * Rate limiter for password reset requests
 * Default: 3 requests per hour per IP
 */
const passwordResetLimiter = createLimiter({
  windowMs: RESET_WINDOW_MS,
  max: RESET_MAX,
  message: { error: 'Too many password reset attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many password reset requests. Please try again later.',
      retryAfter: req.rateLimit ? Math.ceil(req.rateLimit.resetTime / 1000) : undefined,
    });
  },
});

/**
 * General API rate limiter
 * Default: 100 requests per 15 minutes per IP
 */
const apiLimiter = createLimiter({
  windowMs: API_WINDOW_MS,
  max: API_MAX,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP. Please try again later.',
      retryAfter: req.rateLimit ? Math.ceil(req.rateLimit.resetTime / 1000) : undefined,
    });
  },
});

export {
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
};
