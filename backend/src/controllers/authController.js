/**
 * Authentication Controller
 * 
 * Handles user registration, login, and profile updates.
 * Integrates Cloudinary for image uploads (optional).
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prismaClient.js';
import { signToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/emailService.js';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Upload image buffer to Cloudinary (stream-based for Vercel)
 * Ensures consistent 400x400 dimensions for all profile images
 */
const uploadToCloudinary = (fileBuffer, folderName = 'user_profiles') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: folderName,
        // Ensure consistent dimensions: 400x400px
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto:good" },
          { fetch_format: "auto" }
        ]
      },
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
 * 
 * IMPORTANT: The email entered here is THE email we send the reset link to.
 * It doesn't matter what was on the login page - this is a completely separate flow.
 * We look up the user by the email they provide here, and if found, send them a reset link.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email is provided
    if (!email || !email.trim()) {
      return res.status(400).json({ 
        error: 'Email address is required.' 
      });
    }

    console.log('\n=== FORGOT PASSWORD REQUEST ===');
    console.log('Email provided:', email);
    console.log('Looking up user in database...');

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log('User NOT found with email:', email);
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    console.log('User FOUND:', { id: user.id, email: user.email, name: user.fullName });

    // Check if user registered via OAuth (no password to reset)
    if (!user.passwordHash) {
      console.log('User registered via OAuth - no password to reset');
      return res.status(400).json({ 
        error: 'This account was created with Google Sign-In and does not have a password. Please use Google to sign in.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    console.log('Generated reset token (first 10 chars):', resetToken.substring(0, 10) + '...');
    console.log('Token expiry:', resetTokenExpiry);

    // Save hashed token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: resetTokenExpiry,
      },
    });

    console.log('Token saved to database successfully');

    // Send password reset email
    console.log('Attempting to send email to:', user.email);
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM,
    });

    try {
      const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.fullName);
      console.log('✓ Password reset email sent successfully!');
      console.log('Email result:', emailResult);
    } catch (emailError) {
      console.error('✗ Failed to send password reset email:');
      console.error('Error details:', emailError);
      console.error('Error message:', emailError.message);
      console.error('Error stack:', emailError.stack);
      
      // Return error to user so they know email failed
      return res.status(500).json({ 
        error: 'Failed to send reset email. Please try again or contact support.' 
      });
    }
    
    console.log('=== END FORGOT PASSWORD REQUEST ===\n');
    
    res.status(200).json({ 
      message: 'Password reset link has been sent to your email address. Please check your inbox.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
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

/**
 * Google OAuth Callback
 * POST /api/auth/google
 * 
 * @param {Object} req.body - { credential: Google ID token, rememberMe?: boolean }
 */
export const googleAuth = async (req, res, next) => {
  try {
    console.log('\n=== GOOGLE OAUTH REQUEST ===');
    const { credential, rememberMe } = req.body;

    console.log('Credential present:', !!credential);
    console.log('Remember me:', rememberMe);
    console.log('GOOGLE_CLIENT_ID configured:', !!process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_ID value:', process.env.GOOGLE_CLIENT_ID);

    if (!credential) {
      console.log('ERROR: No credential provided');
      return res.status(400).json({ error: 'Google credential is required.' });
    }

    // Verify the Google ID token
    console.log('Verifying Google ID token...');
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log('✓ Token verification successful');
    } catch (error) {
      console.error('✗ Google token verification failed:');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      return res.status(401).json({ 
        error: 'Invalid Google credential. Verification failed.',
        details: error.message 
      });
    }

    const payload = ticket.getPayload();
    console.log('Token payload:', {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });

    const { sub: googleId, email, name, picture } = payload;
    
    // Modify Google profile picture URL to get higher quality and potentially better rate limits
    // Change from s96-c to s400-c for better quality
    let profileImageUrl = picture;
    if (picture && picture.includes('googleusercontent.com') && picture.includes('=s96-c')) {
      profileImageUrl = picture.replace('=s96-c', '=s400-c');
      console.log('Modified profile image URL for better quality:', profileImageUrl);
    }

    if (!email) {
      console.log('ERROR: No email in Google payload');
      return res.status(400).json({ error: 'Email not provided by Google.' });
    }

    console.log('Looking up user in database...');
    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId },
        ],
      },
    });

    if (user) {
      console.log('User found:', { id: user.id, email: user.email, hasGoogleId: !!user.googleId });
    } else {
      console.log('User not found, will create new user');
    }

    // If user exists but doesn't have googleId, link it
    if (user && !user.googleId) {
      console.log('Linking Google account to existing user...');
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
      console.log('✓ Google account linked');
    }

    // If user doesn't exist, create new user
    if (!user) {
      console.log('Creating new user...');
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          fullName: name || null,
          profileImageUrl: profileImageUrl || null,
          passwordHash: null, // OAuth users don't have passwords
        },
      });
      console.log('✓ New user created:', user.id);

      // Create default preferences
      await prisma.userPreference.create({
        data: {
          userId: user.id,
          theme: 'light',
          aiTone: 'empathetic',
          dailyReminder: true,
        },
      });
      console.log('✓ Default preferences created');

      // Send welcome email (non-blocking)
      sendWelcomeEmail(user.email, user.fullName).catch(err => {
        console.error('Failed to send welcome email:', err);
      });
    }

    console.log('Creating tokens...');
    // Create tokens
    const accessToken = signToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id }, rememberMe);

    // Store refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });
    console.log('✓ Tokens created and stored');

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

    console.log('User response being sent:', {
      id: userResponse.id,
      fullName: userResponse.fullName,
      email: userResponse.email,
      profileImageUrl: userResponse.profileImageUrl,
    });
    console.log('✓ Google authentication successful');
    console.log('=== END GOOGLE OAUTH REQUEST ===\n');

    res.status(200).json({
      message: 'Google authentication successful.',
      token: accessToken,
      user: userResponse,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    next(error);
  }
};

