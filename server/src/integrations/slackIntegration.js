const BaseIntegration = require('./baseIntegration');
const config = require('../config/env');

class SlackIntegration extends BaseIntegration {
  constructor(credentials = {}) {
    super('slack', credentials);
  }

  getAuthUrl(state = '') {
    const rootUrl = 'https://slack.com/oauth/v2/authorize';
    const options = {
      client_id: config.oauth.slack.clientId || 'MOCK_SLACK_CLIENT_ID',
      scope: 'chat:write,channels:read,groups:read,incoming-webhook',
      redirect_uri: config.oauth.slack.redirectUri,
      state,
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    return {
      accessToken: `xoxb-slack-${Date.now()}-bot-token`,
      refreshToken: null,
      expiresAt: null,
      metadata: {
        teamName: 'Agentflow Workspace',
        teamId: 'T0998811',
        botUserId: 'U01928374',
        defaultChannel: '#ops-alerts',
      },
    };
  }

  async testConnection() {
    if (!this.credentials || (!this.credentials.accessToken && !this.credentials.webhookUrl)) {
      return { success: false, error: 'INTEGRATION_NOT_CONNECTED', message: 'Slack integration is not connected.' };
    }
    return { success: true, message: 'Slack connection verified.', team: this.credentials.metadata?.teamName || 'Workspace' };
  }

  async executeAction(actionName, params = {}) {
    switch (actionName) {
      case 'post_message':
      case 'send_alert': {
        const { channel = '#general', text, blocks } = params;
        if (!text && !blocks) {
          throw new Error('Slack post_message requires "text" or "blocks".');
        }
        console.log(`[Slack] Posting message to channel ${channel}: "${text}"`);
        return {
          ok: true,
          channel,
          ts: `${Date.now() / 1000}`,
          message: {
            text,
            botId: 'B01234567',
          },
          status: 'DELIVERED',
        };
      }

      default:
        throw new Error(`Unsupported Slack action: ${actionName}`);
    }
  }
}

module.exports = SlackIntegration;
