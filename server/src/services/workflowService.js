const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const aiService = require('./aiService');

class WorkflowService {
  async listWorkflows(userId, { search = '', status = '', tag = '', page = 1, limit = 20 } = {}) {
    const query = { owner: userId };

    if (status) {
      query.status = status;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const workflows = await Workflow.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .exec();

    const total = await Workflow.countDocuments(query);

    return {
      workflows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      },
    };
  }

  async getWorkflowById(userId, workflowId) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found.');
      err.statusCode = 404;
      throw err;
    }
    return workflow;
  }

  async createWorkflow(userId, data) {
    const { name, description, triggerConfig, nodes = [], edges = [], tags = [] } = data;

    const workflow = await Workflow.create({
      name: name || 'Untitled Workflow',
      description: description || '',
      owner: userId,
      status: 'draft',
      triggerConfig: triggerConfig || { type: 'manual' },
      nodes: nodes.length > 0 ? nodes : this._getDefaultInitialNodes(),
      edges: edges.length > 0 ? edges : this._getDefaultInitialEdges(),
      version: 1,
      tags: tags.length > 0 ? tags : ['automation'],
    });

    return workflow;
  }

  async generateWorkflow(userId, prompt) {
    const generated = await aiService.generateWorkflowFromPrompt(prompt);
    
    // Create workflow with generated structure
    const workflow = await Workflow.create({
      name: generated.name || 'AI Generated Automation',
      description: generated.description || `Generated from prompt: "${prompt}"`,
      owner: userId,
      status: 'draft',
      triggerConfig: generated.triggerConfig || { type: 'manual' },
      nodes: generated.nodes || [],
      edges: generated.edges || [],
      version: 1,
      tags: generated.tags || ['ai-generated'],
    });

    return workflow;
  }

  async updateWorkflow(userId, workflowId, data) {
    const existing = await this.getWorkflowById(userId, workflowId);

    const updatePayload = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.triggerConfig && { triggerConfig: data.triggerConfig }),
      ...(data.nodes && { nodes: data.nodes }),
      ...(data.edges && { edges: data.edges }),
      ...(data.tags && { tags: data.tags }),
      version: (existing.version || 1) + 1,
      updatedAt: new Date(),
    };

    const updated = await Workflow.findByIdAndUpdate(workflowId, updatePayload, { new: true });
    return updated;
  }

  async duplicateWorkflow(userId, workflowId) {
    const existing = await this.getWorkflowById(userId, workflowId);

    const cloned = await Workflow.create({
      name: `${existing.name} (Copy)`,
      description: existing.description,
      owner: userId,
      status: 'draft',
      triggerConfig: existing.triggerConfig,
      nodes: existing.nodes,
      edges: existing.edges,
      version: 1,
      tags: existing.tags,
    });

    return cloned;
  }

  async deleteWorkflow(userId, workflowId) {
    await this.getWorkflowById(userId, workflowId);
    await Workflow.findByIdAndDelete(workflowId);
    return { success: true, message: 'Workflow deleted successfully.' };
  }

  async getDashboardStats(userId) {
    const totalWorkflows = await Workflow.countDocuments({ owner: userId });
    const activeWorkflows = await Workflow.countDocuments({ owner: userId, status: 'active' });
    const totalExecutions = await Execution.countDocuments({ owner: userId });
    const successfulExecutions = await Execution.countDocuments({ owner: userId, status: 'COMPLETED' });
    const failedExecutions = await Execution.countDocuments({ owner: userId, status: 'FAILED' });
    const runningExecutions = await Execution.countDocuments({ owner: userId, status: 'RUNNING' });

    const recentExecutions = await Execution.find({ owner: userId })
      .sort({ startTime: -1 })
      .limit(5)
      .exec();

    const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100;

    return {
      metrics: {
        totalWorkflows,
        activeWorkflows,
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        runningExecutions,
        successRate,
      },
      recentExecutions,
    };
  }

  _getDefaultInitialNodes() {
    return [
      {
        id: 'node_1',
        type: 'trigger',
        position: { x: 150, y: 150 },
        data: {
          label: 'Manual Execution Trigger',
          category: 'trigger',
          provider: 'system',
          action: 'manual_trigger',
          params: {},
        },
      },
      {
        id: 'node_2',
        type: 'ai_action',
        position: { x: 480, y: 150 },
        data: {
          label: 'Agent Reasoning Node',
          category: 'ai',
          provider: 'gemini',
          action: 'reasoning',
          params: { prompt: 'Analyze inputs and formulate execution plan' },
        },
      },
    ];
  }

  _getDefaultInitialEdges() {
    return [
      {
        id: 'e1-2',
        source: 'node_1',
        target: 'node_2',
        animated: true,
      },
    ];
  }
}

module.exports = new WorkflowService();
