const mongoose = require('mongoose');
const { createHybridModel } = require('./storeAdapter');

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft',
    },
    triggerConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        type: 'manual', // manual | webhook | schedule | event
        cron: null,
        webhookUrl: null,
        eventProvider: null,
      }),
    },
    nodes: {
      type: Array,
      default: [],
    },
    edges: {
      type: Array,
      default: [],
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: ['automation'],
    },
    lastExecutedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const HybridWorkflow = createHybridModel('Workflow', workflowSchema);
module.exports = HybridWorkflow;
