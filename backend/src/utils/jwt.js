/**
 * JWT Utility Functions
 * 
 * Provides helper functions for signing and verifying JSON Web Tokens (JWT).
 * Supports both access tokens (short-lived) and refresh tokens (long-lived).
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'; // Access token: 15 minutes
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'; // Refresh token: 7 days

/**
 * Signs an access token with the provided payload
 * @param {Object} payload - Data to encode in the token (e.g., { userId, email })
 * @returns {String} Signed JWT access token
 */
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
};

/**
 * Signs a refresh token with the provided payload
 * @param {Object} payload - Data to encode in the token (e.g., { userId })
 * @param {Boolean} rememberMe - If true, extends token lifetime to 30 days
 * @returns {String} Signed JWT refresh token
 */
export const signRefreshToken = (payload, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : JWT_REFRESH_EXPIRY;
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
};

/**
 * Verifies and decodes a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload if token is valid
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
