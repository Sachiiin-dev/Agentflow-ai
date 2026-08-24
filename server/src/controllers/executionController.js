const executionService = require('../services/executionService');

class ExecutionController {
  async listExecutions(req, res, next) {
    try {
      const { workflowId, status, page, limit } = req.query;
      const result = await executionService.listExecutions(req.user.id, { workflowId, status, page, limit });
      res.status(200).json({
        success: true,
        data: result.executions,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getExecutionById(req, res, next) {
    try {
      const result = await executionService.getExecutionById(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        data: result.execution,
        logs: result.logs,
      });
    } catch (err) {
      next(err);
    }
  }

  async getExecutionTimeline(req, res, next) {
    try {
      const result = await executionService.getExecutionTimeline(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async pauseExecution(req, res, next) {
    try {
      const result = await executionService.pauseExecution(req.user.id, req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async resumeExecution(req, res, next) {
    try {
      const result = await executionService.resumeExecution(req.user.id, req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async cancelExecution(req, res, next) {
    try {
      const result = await executionService.cancelExecution(req.user.id, req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ExecutionController();
