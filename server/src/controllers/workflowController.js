const workflowService = require('../services/workflowService');
const executionService = require('../services/executionService');

class WorkflowController {
  async getDashboard(req, res, next) {
    try {
      const stats = await workflowService.getDashboardStats(req.user.id);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  async listWorkflows(req, res, next) {
    try {
      const { search, status, tag, page, limit } = req.query;
      const result = await workflowService.listWorkflows(req.user.id, { search, status, tag, page, limit });
      res.status(200).json({
        success: true,
        data: result.workflows,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async createWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Workflow created successfully.',
        data: workflow,
      });
    } catch (err) {
      next(err);
    }
  }

  async generateWorkflow(req, res, next) {
    try {
      const { prompt } = req.body;
      const workflow = await workflowService.generateWorkflow(req.user.id, prompt);
      res.status(201).json({
        success: true,
        message: 'Workflow generated via AI successfully.',
        data: workflow,
      });
    } catch (err) {
      next(err);
    }
  }

  async getWorkflowById(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        data: workflow,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.updateWorkflow(req.user.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Workflow updated successfully.',
        data: workflow,
      });
    } catch (err) {
      next(err);
    }
  }

  async duplicateWorkflow(req, res, next) {
    try {
      const cloned = await workflowService.duplicateWorkflow(req.user.id, req.params.id);
      res.status(201).json({
        success: true,
        message: 'Workflow duplicated successfully.',
        data: cloned,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkflow(req, res, next) {
    try {
      const result = await workflowService.deleteWorkflow(req.user.id, req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async executeWorkflow(req, res, next) {
    try {
      const execution = await executionService.triggerExecution(req.user.id, req.params.id, req.body.inputs || {});
      res.status(201).json({
        success: true,
        message: 'Execution triggered successfully.',
        data: execution,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkflowController();
