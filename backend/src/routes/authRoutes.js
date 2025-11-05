/**
 * Authentication Routes
 * 
 * Defines routes for user authentication (registration, login, and profile updates).
 * Supports optional profile image uploads via Cloudinary.
 * Routes: POST /register, POST /login, PUT /update-profile
 */

import express from 'express';
import { register, login, updateUser } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validators/userValidator.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

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
 */
router.post('/register', upload.single('profileImage'), validateRegister, register);

/**
 * POST /api/auth/login
 * Login user and receive JWT token
 * Body (JSON): { email, password }
 */
router.post('/login', validateLogin, login);

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

export default router;
