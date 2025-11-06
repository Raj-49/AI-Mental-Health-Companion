/**
 * Authentication Controller
 * 
 * Handles user registration, login, and profile updates.
 * Integrates Cloudinary for image uploads (optional).
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../config/prismaClient.js';
import { signToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/emailService.js';

/**
 * Upload image buffer to Cloudinary (stream-based for Vercel)
 */
const uploadToCloudinary = (fileBuffer, folderName = 'user_profiles') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * Register a new user
 * POST /api/auth/register
 * 
 * @param {Object} req.body - { fullName?, email, password, age?, gender? }
 * @param {File} req.file - optional profile image file
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, age, gender } = req.body;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    // Upload image if provided
    let imageUrl = null;
    if (req.file && req.file.buffer) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: fullName || null,
        email,
        passwordHash,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        profileImageUrl: imageUrl,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        age: true,
        gender: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create default preferences
    await prisma.userPreference.create({
      data: {
        userId: user.id,
        theme: 'light',
        aiTone: 'empathetic',
        dailyReminder: true,
      },
    });

    // Create tokens
    const accessToken = signToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    // Store refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.fullName).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.status(201).json({
      message: 'User registered successfully.',
      token: accessToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    // Check if user registered via OAuth (no password)
    if (!user.passwordHash) {
      return res.status(401).json({ 
        error: 'This account was created with Google Sign-In. Please use Google to log in.' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid email or password.' });

    // Create tokens
    const accessToken = signToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id }, rememberMe);

    // Store refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Set refresh token as httpOnly cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge,
    });

    const userResponse = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      age: user.age,
      gender: user.gender,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      message: 'Login successful.',
      token: accessToken,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile details (and image if provided)
 * PUT /api/auth/update
 * Protected route (requires authMiddleware)
 */
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user?.userId; // Extracted from JWT by middleware
    const { fullName, age, gender } = req.body;

    // Handle image upload if provided
    let imageUrl = null;
    if (req.file && req.file.buffer) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName || undefined,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        profileImageUrl: imageUrl || undefined,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        age: true,
        gender: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'User profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password - Generate reset token and send email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save hashed token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: resetTokenExpiry,
      },
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.fullName);
      console.log('Password reset email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to avoid revealing if user exists
    }
    
    res.status(200).json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password - Verify token and update password
 * POST /api/auth/reset-password?token=<token>
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required.' });
    }

    // Hash the provided token to match with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token
 * POST /api/auth/refresh
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found. Please log in again.' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired refresh token. Please log in again.' });
    }

    // Check if refresh token matches in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        refreshToken: true,
      },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token. Please log in again.' });
    }

    // Generate new access token
    const newAccessToken = signToken({ userId: user.id, email: user.email });

    res.status(200).json({
      message: 'Access token refreshed successfully.',
      token: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    // Clear refresh token from database
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};
