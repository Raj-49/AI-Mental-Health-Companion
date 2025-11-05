/**
 * JWT Utility Functions
 * 
 * Provides helper functions for signing and verifying JSON Web Tokens (JWT).
 * Tokens are used for user authentication and authorization.
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

/**
 * Signs a JWT token with the provided payload
 * @param {Object} payload - Data to encode in the token (e.g., { userId, email })
 * @returns {String} Signed JWT token
 */
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
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
