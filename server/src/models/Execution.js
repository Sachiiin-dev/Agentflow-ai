const mongoose = require('mongoose');
const { createHybridModel } = require('./storeAdapter');

const executionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workflowSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING',
    },
    currentNode: {
      type: String,
      default: null,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // In milliseconds
    },
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    outputs: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    nodeOutputs: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    error: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    langGraphStatus: {
      type: String,
      enum: ['available', 'not-installed'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

const HybridExecution = createHybridModel('Execution', executionSchema);
module.exports = HybridExecution;
