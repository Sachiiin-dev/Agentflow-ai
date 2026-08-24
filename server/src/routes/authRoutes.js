const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// Rate limiter for authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validate,
  authController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// Password reset request
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')],
  validate,
  authController.requestPasswordReset
);

// Complete password reset from emailed token
router.post(
  '/reset-password',
  [
    body('token').isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('A valid reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validate,
  authController.resetPassword
);

// Get current profile
router.get('/me', authMiddleware, authController.getMe);

// Admin-Only Routes
router.get('/users', authMiddleware, requireRole('admin'), authController.listUsers);
router.patch('/users/:id/role', authMiddleware, requireRole('admin'), authController.updateRole);
router.delete('/users/:id', authMiddleware, requireRole('admin'), authController.deleteUser);
router.get('/admin/diagnostics', authMiddleware, requireRole('admin'), authController.getDiagnostics);

module.exports = router;
