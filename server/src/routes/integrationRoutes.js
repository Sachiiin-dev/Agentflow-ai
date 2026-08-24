const express = require('express');
const { body } = require('express-validator');
const integrationController = require('../controllers/integrationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// OAuth callback does not require Bearer token (uses state)
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);
router.get('/oauth/error', integrationController.handleOAuthError);

// Protected routes
router.use(authMiddleware);

// List integrations
router.get('/', integrationController.listIntegrations);

// Check health / status of integrations
router.get('/status', integrationController.getStatus);

// Start OAuth flow
router.get('/oauth/:provider/start', integrationController.startOAuth);

// Save manual credentials / API keys
router.post(
  '/',
  [
    body('provider').isIn(['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini']).withMessage('Invalid provider'),
    body('credentials').notEmpty().withMessage('Credentials payload is required'),
  ],
  validate,
  integrationController.saveManualCredentials
);

// Disconnect integration
router.delete('/:provider', integrationController.disconnect);

module.exports = router;
