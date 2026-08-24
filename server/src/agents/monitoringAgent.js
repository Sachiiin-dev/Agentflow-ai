const ExecutionLog = require('../models/ExecutionLog');
const Notification = require('../models/Notification');
const { emitToExecution, broadcastNotification } = require('../config/socket');

/**
 * Monitoring Agent
 * Persists timeline events to ExecutionLog and broadcasts live events over Socket.IO
 */
class MonitoringAgent {
  constructor() {
    this.name = 'monitoring';
  }

  async emitEvent({ executionId, workflowId, nodeId = null, agent, level = 'info', message, metadata = {} }) {
    // 1. Write granular log to DB
    const logDoc = await ExecutionLog.create({
      executionId,
      workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata,
      timestamp: new Date(),
    });

    // 2. Stream event to connected clients on Socket.IO
    emitToExecution(executionId, 'agent_event', {
      id: logDoc._id || logDoc.id,
      executionId,
      workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata,
      timestamp: logDoc.timestamp,
    });

    return logDoc;
  }

  async notifyOperator({ userId, workflowId = null, executionId = null, type, title, message }) {
    const notif = await Notification.create({
      owner: userId,
      workflowId,
      executionId,
      type,
      title,
      message,
      isRead: false,
    });

    broadcastNotification(notif);
    return notif;
  }
}

module.exports = new MonitoringAgent();
