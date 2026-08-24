const BaseIntegration = require('./baseIntegration');
const config = require('../config/env');

class DiscordIntegration extends BaseIntegration {
  constructor(credentials = {}) {
    super('discord', credentials);
  }

  getAuthUrl(state = '') {
    const rootUrl = 'https://discord.com/api/oauth2/authorize';
    const options = {
      client_id: config.oauth.discord.clientId || 'MOCK_DISCORD_CLIENT_ID',
      permissions: '2048', // Send Messages
      scope: 'bot applications.commands',
      redirect_uri: config.oauth.discord.redirectUri,
      state,
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    return {
      accessToken: `discord_bot_token_${Date.now()}`,
      refreshToken: null,
      expiresAt: null,
      metadata: {
        guildName: 'Agentflow Community Server',
        guildId: '1029384756',
        channelName: '#general',
        channelId: '987654321',
      },
    };
  }

  async testConnection() {
    if (!this.credentials || (!this.credentials.accessToken && !this.credentials.webhookUrl)) {
      return { success: false, error: 'INTEGRATION_NOT_CONNECTED', message: 'Discord integration is not connected.' };
    }
    return { success: true, message: 'Discord Bot connection active.', guild: this.credentials.metadata?.guildName || 'Discord Server' };
  }

  async executeAction(actionName, params = {}) {
    switch (actionName) {
      case 'post_message':
      case 'send_embed': {
        const { channelId, content, embed, title, description } = params;
        const textContent = content || description || 'Agentflow Automation Alert';
        console.log(`[Discord] Dispatching message to channel ${channelId || 'default'}: "${textContent}"`);
        return {
          id: `disc_msg_${Date.now()}`,
          channelId: channelId || 'default-channel',
          content: textContent,
          embed: embed || (title ? { title, description } : null),
          timestamp: new Date().toISOString(),
          status: 'DELIVERED',
        };
      }

      default:
        throw new Error(`Unsupported Discord action: ${actionName}`);
    }
  }
}

module.exports = DiscordIntegration;
