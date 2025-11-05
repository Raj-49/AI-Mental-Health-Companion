/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens from Authorization header and attaches user information
 * to the request object. Protects routes that require authentication.
 */

import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/prismaClient.js';

/**
 * Middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Get token without 'Bearer ' prefix
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token format.' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({ 
        error: 'Invalid or expired token.' 
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    // Optional: Fetch full user record from database
    // This prevents additional DB queries in controllers
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
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

      if (!user) {
        return res.status(401).json({ 
          error: 'User not found. Token may be invalid.' 
        });
      }

      req.currentUser = user;
    } catch (dbError) {
      console.error('[Auth Middleware] Database error:', dbError);
      return res.status(500).json({ 
        error: 'Failed to authenticate user.' 
      });
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware] Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed.' 
    });
  }
};
