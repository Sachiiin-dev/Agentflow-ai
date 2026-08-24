const express = require('express');
const { body } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// All workflow routes require authentication
router.use(authMiddleware);

// Aggregated dashboard stats
router.get('/dashboard', workflowController.getDashboard);

// List user workflows
router.get('/', workflowController.listWorkflows);

// Create workflow manually
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
  ],
  validate,
  workflowController.createWorkflow
);

// Generate workflow from natural language prompt via AI
router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Prompt is required for workflow generation'),
  ],
  validate,
  workflowController.generateWorkflow
);

// Get single workflow
router.get('/:id', workflowController.getWorkflowById);

// Update workflow
router.put('/:id', workflowController.updateWorkflow);

// Duplicate workflow
router.post('/:id/duplicate', workflowController.duplicateWorkflow);

// Execute workflow
router.post('/:id/execute', workflowController.executeWorkflow);

// Delete workflow
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
