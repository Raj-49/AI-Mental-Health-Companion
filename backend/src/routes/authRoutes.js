/**
 * Authentication Routes
 * 
 * Defines routes for user authentication (registration, login, and profile updates).
 * Supports optional profile image uploads via Cloudinary.
 * Routes: POST /register, POST /login, PUT /update-profile
 */

import express from 'express';
import { register, login, updateUser, forgotPassword, resetPassword, refreshAccessToken, logout } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validators/userValidator.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';
import { authLimiter, passwordResetLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with optional profile image
 * Body (form-data): 
 *   - email (required)
 *   - password (required)
 *   - fullName (optional)
 *   - age (optional)
 *   - gender (optional)
 *   - profileImage (optional, file)
 * Rate limited: 5 requests per 15 minutes per IP
 */
router.post('/register', authLimiter, upload.single('profileImage'), validateRegister, register);

/**
 * POST /api/auth/login
 * Login user and receive JWT token
 * Body (JSON): { email, password }
 * Rate limited: 5 requests per 15 minutes per IP
 */
router.post('/login', authLimiter, validateLogin, login);

/**
 * PUT /api/auth/update-profile
 * Update user profile with optional new profile image
 * Protected route - requires JWT authentication
 * Body (form-data):
 *   - fullName (optional)
 *   - age (optional)
 *   - gender (optional)
 *   - profileImage (optional, file)
 */
router.put('/update-profile', authMiddleware, upload.single('profileImage'), updateUser);

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 * Body (JSON): { email }
 * Rate limited: 3 requests per hour per IP
 */
router.post('/forgot-password', passwordResetLimiter, forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 * Query: ?token=<reset_token>
 * Body (JSON): { password }
 * Rate limited: 3 requests per hour per IP
 */
router.post('/reset-password', passwordResetLimiter, resetPassword);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from httpOnly cookie
 * No body required - reads from cookie
 */
router.post('/refresh', refreshAccessToken);

/**
 * POST /api/auth/logout
 * Logout user and clear refresh token
 * Protected route - requires JWT authentication
 */
router.post('/logout', authMiddleware, logout);

export default router;
