/**
 * Global Error Handler Middleware
 * 
 * Centralized error handling for the entire application.
 * Logs errors and returns structured JSON responses.
 * Handles Prisma-specific errors, Multer errors, and JWT errors.
 */

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error details to console
  console.error('[Error Handler]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle Multer errors (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 5MB.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field.',
      });
    }
    return res.status(400).json({
      error: 'File upload error.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Handle custom file filter errors
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      error: 'Only image files are allowed (jpg, jpeg, png, gif, webp).',
    });
  }

  // Handle Cloudinary errors
  if (err.message && err.message.includes('cloudinary')) {
    return res.status(500).json({
      error: 'Image upload failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Handle Prisma Client errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const target = err.meta?.target || ['field'];
        return res.status(409).json({
          error: `A record with this ${target[0]} already exists.`,
          details: process.env.NODE_ENV === 'development' ? err.meta : undefined,
        });

      case 'P2025':
        // Record not found
        return res.status(404).json({
          error: 'Record not found.',
          details: process.env.NODE_ENV === 'development' ? err.meta : undefined,
        });

      case 'P2003':
        // Foreign key constraint violation
        return res.status(400).json({
          error: 'Invalid reference. Related record does not exist.',
          details: process.env.NODE_ENV === 'development' ? err.meta : undefined,
        });

      default:
        // Other Prisma errors
        return res.status(500).json({
          error: 'Database error occurred.',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error.',
      details: err.message,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired.',
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
