const Integration = require('../models/Integration');
const { encrypt, decrypt } = require('../utils/encryption');
const GmailIntegration = require('../integrations/gmailIntegration');
const SlackIntegration = require('../integrations/slackIntegration');
const DiscordIntegration = require('../integrations/discordIntegration');
const GoogleSheetsIntegration = require('../integrations/googleSheetsIntegration');

const PROVIDERS = {
  gmail: GmailIntegration,
  slack: SlackIntegration,
  discord: DiscordIntegration,
  'google-sheets': GoogleSheetsIntegration,
};

class IntegrationService {
  getIntegrationInstance(provider, credentials = {}) {
    const IntegrationClass = PROVIDERS[provider];
    if (!IntegrationClass) {
      throw new Error(`Unsupported integration provider: ${provider}`);
    }
    return new IntegrationClass(credentials);
  }

  async getUserIntegrations(userId) {
    const integrations = await Integration.find({ owner: userId });
    
    // Build map for standard 4 providers + AI providers
    const allProviders = ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'];
    const results = allProviders.map((p) => {
      const found = integrations.find((i) => i.provider === p);
      if (found) {
        return {
          id: found._id || found.id,
          provider: found.provider,
          isConnected: found.isConnected,
          scopes: found.scopes || [],
          metadata: found.metadata || {},
          expiresAt: found.expiresAt,
          lastSyncAt: found.lastSyncAt,
          hasCredentials: !!found.encryptedTokens,
        };
      }
      return {
        id: null,
        provider: p,
        isConnected: false,
        scopes: [],
        metadata: {},
        expiresAt: null,
        lastSyncAt: null,
        hasCredentials: false,
      };
    });

    return results;
  }

  async getIntegrationStatus(userId, provider) {
    const integration = await Integration.findOne({ owner: userId, provider });
    if (!integration || !integration.isConnected || !integration.encryptedTokens) {
      return {
        provider,
        isConnected: false,
        error: 'INTEGRATION_NOT_CONNECTED',
        message: `${provider} is not connected. Please connect via OAuth or provide credentials in Integrations settings.`,
      };
    }

    try {
      const decrypted = decrypt(integration.encryptedTokens);
      const instance = this.getIntegrationInstance(provider, decrypted);
      const testResult = await instance.testConnection();
      return {
        provider,
        isConnected: testResult.success,
        metadata: integration.metadata,
        testResult,
      };
    } catch (err) {
      return {
        provider,
        isConnected: false,
        error: 'AUTH_EXPIRED',
        message: `Authentication expired or corrupted for ${provider}: ${err.message}`,
      };
    }
  }

  async saveCredentials(userId, provider, rawCredentials, metadata = {}, scopes = []) {
    const encryptedTokens = encrypt(rawCredentials);
    
    let integration = await Integration.findOne({ owner: userId, provider });
    if (integration) {
      integration = await Integration.findByIdAndUpdate(
        integration._id || integration.id,
        {
          isConnected: true,
          encryptedTokens,
          metadata: { ...integration.metadata, ...metadata },
          scopes: scopes.length > 0 ? scopes : integration.scopes,
          lastSyncAt: new Date(),
        },
        { new: true }
      );
    } else {
      integration = await Integration.create({
        owner: userId,
        provider,
        isConnected: true,
        encryptedTokens,
        metadata,
        scopes,
        lastSyncAt: new Date(),
      });
    }

    return {
      id: integration._id || integration.id,
      provider: integration.provider,
      isConnected: true,
      metadata: integration.metadata,
      scopes: integration.scopes,
    };
  }

  async disconnectIntegration(userId, provider) {
    const integration = await Integration.findOne({ owner: userId, provider });
    if (integration) {
      await Integration.findByIdAndUpdate(integration._id || integration.id, {
        isConnected: false,
        encryptedTokens: null,
      });
    }
    return { provider, isConnected: false };
  }

  getOAuthStartUrl(provider, state) {
    const instance = this.getIntegrationInstance(provider);
    return instance.getAuthUrl(state);
  }

  async handleOAuthCallback(userId, provider, code) {
    const instance = this.getIntegrationInstance(provider);
    const tokens = await instance.handleCallback(code);
    return await this.saveCredentials(userId, provider, tokens, tokens.metadata || {}, tokens.scopes || []);
  }

  async executeIntegrationAction(userId, provider, actionName, params = {}) {
    const integration = await Integration.findOne({ owner: userId, provider });
    
    // If not in DB, check if running in demo sandbox mode
    let credentials = {};
    if (integration && integration.encryptedTokens) {
      credentials = decrypt(integration.encryptedTokens);
    }

    const instance = this.getIntegrationInstance(provider, credentials);
    return await instance.executeAction(actionName, params);
  }
}

module.exports = new IntegrationService();
