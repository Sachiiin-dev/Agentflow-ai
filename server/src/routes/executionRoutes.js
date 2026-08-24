const express = require('express');
const executionController = require('../controllers/executionController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// List execution runs
router.get('/', executionController.listExecutions);

// Get execution details and logs
router.get('/:id', executionController.getExecutionById);

// Get detailed agent timeline
router.get('/:id/timeline', executionController.getExecutionTimeline);

// Pause execution
router.post('/:id/pause', executionController.pauseExecution);

// Resume execution
router.post('/:id/resume', executionController.resumeExecution);

// Cancel execution
router.post('/:id/cancel', executionController.cancelExecution);

module.exports = router;
