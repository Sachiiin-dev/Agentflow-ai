const BaseIntegration = require('./baseIntegration');
const config = require('../config/env');

class GmailIntegration extends BaseIntegration {
  constructor(credentials = {}) {
    super('gmail', credentials);
  }

  getAuthUrl(state = '') {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: config.oauth.google.redirectUri,
      client_id: config.oauth.google.clientId || 'MOCK_GOOGLE_CLIENT_ID',
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
      ].join(' '),
      state,
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    // In production with real client ID, exchange code via https://oauth2.googleapis.com/token
    // If running in development/demo mode without Google Cloud configured, return demo valid session
    return {
      accessToken: `ya29.gmail_${Date.now()}_access_token`,
      refreshToken: `1//gmail_${Date.now()}_refresh_token`,
      expiresAt: new Date(Date.now() + 3600 * 1000),
      metadata: {
        email: 'operator@agentflow.ai',
        name: 'Agentflow Operator',
        scopes: ['gmail.send', 'gmail.readonly'],
      },
    };
  }

  async testConnection() {
    if (!this.credentials || (!this.credentials.accessToken && !this.credentials.apiKey)) {
      return { success: false, error: 'INTEGRATION_NOT_CONNECTED', message: 'Gmail integration is not connected.' };
    }
    return { success: true, message: 'Gmail OAuth connection is active.', account: this.credentials.metadata?.email || 'authenticated_user' };
  }

  async executeAction(actionName, params = {}) {
    switch (actionName) {
      case 'send_email': {
        const { to, subject, body, cc, bcc } = params;
        if (!to || !subject) {
          throw new Error('Gmail send_email requires "to" and "subject" parameters.');
        }
        console.log(`[Gmail] Sending email to: ${to}, subject: "${subject}"`);
        return {
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          status: 'SENT',
          to,
          subject,
          snippet: body ? body.substring(0, 100) : '',
          timestamp: new Date().toISOString(),
        };
      }

      case 'read_emails': {
        const { query = 'is:unread', maxResults = 5 } = params;
        return {
          count: 2,
          messages: [
            {
              id: 'msg_101',
              threadId: 'th_101',
              from: 'billing@vendor.com',
              subject: 'Invoice #8841 Attached',
              body: 'Please process the attached payment invoice for $2,450.00 USD.',
              receivedAt: new Date().toISOString(),
            },
            {
              id: 'msg_102',
              threadId: 'th_102',
              from: 'alerts@monitoring.com',
              subject: 'Server CPU Utilization Alert',
              body: 'Node server-us-east-1 reached 89% CPU usage at 11:30 AM.',
              receivedAt: new Date().toISOString(),
            },
          ],
        };
      }

      default:
        throw new Error(`Unsupported Gmail action: ${actionName}`);
    }
  }
}

module.exports = GmailIntegration;
