/**
 * User Validation Functions
 * 
 * Provides validation middleware and helper functions for user-related requests.
 * Validates email format, password strength, and required fields.
 */

/**
 * Email validation regex (basic RFC 5322 compliant)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates registration request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateRegister = (req, res, next) => {
  const { email, password, fullName } = req.body;
  const errors = [];

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Invalid email format');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Validate full name (optional but if provided should not be empty)
  if (fullName !== undefined && fullName.trim() === '') {
    errors.push('Full name cannot be empty if provided');
  }

  // Validate age if provided
  if (req.body.age !== undefined) {
    const age = parseInt(req.body.age);
    if (isNaN(age) || age < 13 || age > 120) {
      errors.push('Age must be between 13 and 120');
    }
  }

  // Validate gender if provided
  if (req.body.gender !== undefined && req.body.gender.trim() === '') {
    errors.push('Gender cannot be empty if provided');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

/**
 * Validates login request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Invalid email format');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

/**
 * Validates user profile update request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateProfileUpdate = (req, res, next) => {
  const { fullName, age, gender, profileImageUrl } = req.body;
  const errors = [];

  // Validate full name if provided
  if (fullName !== undefined && fullName.trim() === '') {
    errors.push('Full name cannot be empty if provided');
  }

  // Validate age if provided
  if (age !== undefined) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      errors.push('Age must be between 13 and 120');
    }
  }

  // Validate gender if provided
  if (gender !== undefined && gender.trim() === '') {
    errors.push('Gender cannot be empty if provided');
  }

  // Validate profile image URL if provided (basic URL check)
  if (profileImageUrl !== undefined && profileImageUrl !== '') {
    try {
      new URL(profileImageUrl);
    } catch (e) {
      errors.push('Invalid profile image URL format');
    }
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};
