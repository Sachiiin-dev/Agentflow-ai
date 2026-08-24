/**
 * Base Integration Class
 * Standard interface implemented by all third-party integrations (Gmail, Slack, Discord, Google Sheets)
 */
class BaseIntegration {
  constructor(providerName, credentials = {}) {
    this.providerName = providerName;
    this.credentials = credentials; // Decrypted tokens/keys
  }

  /**
   * Generates OAuth authorization URL
   */
  getAuthUrl(state) {
    throw new Error(`getAuthUrl() must be implemented by ${this.providerName}`);
  }

  /**
   * Exchanges OAuth code for tokens
   */
  async handleCallback(code) {
    throw new Error(`handleCallback() must be implemented by ${this.providerName}`);
  }

  /**
   * Tests whether current credentials are valid and active
   */
  async testConnection() {
    throw new Error(`testConnection() must be implemented by ${this.providerName}`);
  }

  /**
   * Executes a provider-specific action
   */
  async executeAction(actionName, params = {}) {
    throw new Error(`executeAction() must be implemented by ${this.providerName}`);
  }

  /**
   * Refreshes access token if expired
   */
  async refreshToken() {
    return this.credentials;
  }
}

module.exports = BaseIntegration;
