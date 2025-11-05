/**
 * Authentication Controller
 * 
 * Handles user registration, login, and profile updates.
 * Integrates Cloudinary for image uploads (optional).
 */

import bcrypt from 'bcrypt';
import prisma from '../config/prismaClient.js';
import { signToken } from '../utils/jwt.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

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

    // JWT token
    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully.',
      token,
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
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = signToken({ userId: user.id, email: user.email });

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
      token,
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
