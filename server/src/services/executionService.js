const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const orchestrator = require('../agents/orchestrator');
const { queueExecution } = require('../queues/executionQueue');

class ExecutionService {
  async triggerExecution(userId, workflowId, inputs = {}) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found.');
      err.statusCode = 404;
      throw err;
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      const err = new Error('Cannot execute empty workflow. Please add at least one node.');
      err.statusCode = 400;
      throw err;
    }

    // Create immutable snapshot of workflow at runtime
    const workflowSnapshot = {
      _id: workflow._id || workflow.id,
      name: workflow.name,
      description: workflow.description,
      triggerConfig: workflow.triggerConfig,
      nodes: workflow.nodes,
      edges: workflow.edges,
      version: workflow.version,
      tags: workflow.tags,
    };

    const execution = await Execution.create({
      workflowId: workflow._id || workflow.id,
      owner: userId,
      workflowSnapshot,
      status: 'PENDING',
      currentNode: null,
      startTime: new Date(),
      inputs,
      outputs: {},
      error: null,
      retryCount: 0,
      langGraphStatus: 'available',
    });

    const executionId = execution._id || execution.id;

    // Queue execution background job
    await queueExecution(executionId);

    return execution;
  }

  async listExecutions(userId, { workflowId, status, page = 1, limit = 20 } = {}) {
    const query = { owner: userId };

    if (workflowId) {
      query.workflowId = workflowId;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const executions = await Execution.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .exec();

    const total = await Execution.countDocuments(query);

    return {
      executions,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      },
    };
  }

  async getExecutionById(userId, executionId) {
    const execution = await Execution.findOne({ _id: executionId, owner: userId });
    if (!execution) {
      const err = new Error('Execution run not found.');
      err.statusCode = 404;
      throw err;
    }

    const logs = await ExecutionLog.find({ executionId: execution._id || execution.id })
      .sort({ timestamp: 1 })
      .exec();

    return {
      execution,
      logs,
    };
  }

  async getExecutionTimeline(userId, executionId) {
    const execution = await Execution.findOne({ _id: executionId, owner: userId });
    if (!execution) {
      const err = new Error('Execution run not found.');
      err.statusCode = 404;
      throw err;
    }

    const logs = await ExecutionLog.find({ executionId: execution._id || execution.id })
      .sort({ timestamp: 1 })
      .exec();

    return {
      executionId: execution._id || execution.id,
      workflowName: execution.workflowSnapshot?.name || 'Workflow Run',
      status: execution.status,
      duration: execution.duration,
      startTime: execution.startTime,
      endTime: execution.endTime,
      timeline: logs,
    };
  }

  async pauseExecution(userId, executionId) {
    const execution = await Execution.findOne({ _id: executionId, owner: userId });
    if (!execution) {
      const err = new Error('Execution not found.');
      err.statusCode = 404;
      throw err;
    }

    if (execution.status !== 'RUNNING') {
      const err = new Error(`Cannot pause execution with status: ${execution.status}`);
      err.statusCode = 400;
      throw err;
    }

    orchestrator.setExecutionControl(executionId, 'pause');
    return { success: true, message: 'Pause signal sent to orchestrator.' };
  }

  async resumeExecution(userId, executionId) {
    const execution = await Execution.findOne({ _id: executionId, owner: userId });
    if (!execution) {
      const err = new Error('Execution not found.');
      err.statusCode = 404;
      throw err;
    }

    if (execution.status !== 'PAUSED') {
      const err = new Error(`Cannot resume execution with status: ${execution.status}`);
      err.statusCode = 400;
      throw err;
    }

    orchestrator.setExecutionControl(executionId, 'resume');
    await queueExecution(executionId);
    return { success: true, message: 'Execution resumed.' };
  }

  async cancelExecution(userId, executionId) {
    const execution = await Execution.findOne({ _id: executionId, owner: userId });
    if (!execution) {
      const err = new Error('Execution not found.');
      err.statusCode = 404;
      throw err;
    }

    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(execution.status)) {
      const err = new Error(`Cannot cancel already finished execution (${execution.status}).`);
      err.statusCode = 400;
      throw err;
    }

    orchestrator.setExecutionControl(executionId, 'cancel');
    await Execution.findByIdAndUpdate(executionId, {
      status: 'CANCELLED',
      endTime: new Date(),
    });

    return { success: true, message: 'Execution cancelled.' };
  }
}

module.exports = new ExecutionService();
