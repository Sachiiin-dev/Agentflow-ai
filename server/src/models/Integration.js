const mongoose = require('mongoose');
const { createHybridModel } = require('./storeAdapter');

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    scopes: {
      type: [String],
      default: [],
    },
    encryptedTokens: {
      type: String, // Encrypted string format (iv:tag:ciphertext)
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const HybridIntegration = createHybridModel('Integration', integrationSchema);
module.exports = HybridIntegration;
