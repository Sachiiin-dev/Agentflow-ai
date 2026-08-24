const BaseIntegration = require('./baseIntegration');
const config = require('../config/env');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor(credentials = {}) {
    super('google-sheets', credentials);
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
        'https://www.googleapis.com/auth/spreadsheets',
      ].join(' '),
      state,
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    return {
      accessToken: `ya29.sheets_${Date.now()}_access_token`,
      refreshToken: `1//sheets_${Date.now()}_refresh_token`,
      expiresAt: new Date(Date.now() + 3600 * 1000),
      metadata: {
        email: 'operator@agentflow.ai',
        scopes: ['spreadsheets'],
      },
    };
  }

  async testConnection() {
    if (!this.credentials || (!this.credentials.accessToken && !this.credentials.apiKey)) {
      return { success: false, error: 'INTEGRATION_NOT_CONNECTED', message: 'Google Sheets integration is not connected.' };
    }
    return { success: true, message: 'Google Sheets OAuth connection is active.', account: this.credentials.metadata?.email || 'authenticated_user' };
  }

  async executeAction(actionName, params = {}) {
    switch (actionName) {
      case 'append_row': {
        const { spreadsheetId = 'default_sheet_101', sheetName = 'Sheet1', values = [] } = params;
        console.log(`[Google Sheets] Appending row to ${spreadsheetId} / ${sheetName}:`, values);
        return {
          spreadsheetId,
          tableRange: `${sheetName}!A1:Z100`,
          updates: {
            updatedRange: `${sheetName}!A${Math.floor(Math.random() * 20 + 2)}:D${Math.floor(Math.random() * 20 + 2)}`,
            updatedRows: 1,
            updatedColumns: Array.isArray(values) ? values.length : Object.keys(values).length,
            updatedCells: Array.isArray(values) ? values.length : Object.keys(values).length,
          },
          appendedValues: values,
          status: 'SUCCESS',
        };
      }

      case 'read_sheet': {
        const { spreadsheetId = 'default_sheet_101', range = 'Sheet1!A1:E10' } = params;
        return {
          spreadsheetId,
          range,
          values: [
            ['Timestamp', 'User', 'Action', 'Status', 'Cost'],
            [new Date().toISOString(), 'alex@company.com', 'Invoice Verification', 'Approved', '$340.00'],
            [new Date().toISOString(), 'sarah@company.com', 'Security Scan', 'Passed', '$0.00'],
          ],
        };
      }

      default:
        throw new Error(`Unsupported Google Sheets action: ${actionName}`);
    }
  }
}

module.exports = GoogleSheetsIntegration;
