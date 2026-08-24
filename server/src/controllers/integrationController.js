const integrationService = require('../services/integrationService');
const config = require('../config/env');

class IntegrationController {
  async listIntegrations(req, res, next) {
    try {
      const integrations = await integrationService.getUserIntegrations(req.user.id);
      res.status(200).json({
        success: true,
        data: integrations,
      });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req, res, next) {
    try {
      const { provider } = req.query;
      if (provider) {
        const status = await integrationService.getIntegrationStatus(req.user.id, provider);
        return res.status(200).json({ success: true, data: status });
      }
      
      const allProviders = ['gmail', 'slack', 'discord', 'google-sheets'];
      const statuses = await Promise.all(
        allProviders.map((p) => integrationService.getIntegrationStatus(req.user.id, p))
      );
      res.status(200).json({
        success: true,
        data: statuses,
      });
    } catch (err) {
      next(err);
    }
  }

  async startOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const state = Buffer.from(JSON.stringify({ userId: req.user.id, provider })).toString('base64');
      const url = integrationService.getOAuthStartUrl(provider, state);
      res.status(200).json({
        success: true,
        url,
      });
    } catch (err) {
      next(err);
    }
  }

  async handleOAuthCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state } = req.query;

      let userId = req.user ? req.user.id : null;
      if (!userId && state) {
        try {
          const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
          userId = parsed.userId;
        } catch {
          // ignore
        }
      }

      if (!userId) {
        return res.redirect(`${config.clientUrl}/integrations?error=AUTH_STATE_MISSING`);
      }

      await integrationService.handleOAuthCallback(userId, provider, code);
      res.redirect(`${config.clientUrl}/integrations?connected=${provider}`);
    } catch (err) {
      res.redirect(`${config.clientUrl}/integrations?error=${encodeURIComponent(err.message)}`);
    }
  }

  async handleOAuthError(req, res, next) {
    res.status(400).json({
      success: false,
      error: 'OAUTH_FAILED',
      message: 'OAuth handshake was cancelled or failed.',
    });
  }

  async saveManualCredentials(req, res, next) {
    try {
      const { provider, credentials, metadata, scopes } = req.body;
      const saved = await integrationService.saveCredentials(
        req.user.id,
        provider,
        credentials,
        metadata || {},
        scopes || []
      );
      res.status(200).json({
        success: true,
        message: `${provider} credentials saved successfully.`,
        data: saved,
      });
    } catch (err) {
      next(err);
    }
  }

  async disconnect(req, res, next) {
    try {
      const { provider } = req.params;
      const result = await integrationService.disconnectIntegration(req.user.id, provider);
      res.status(200).json({
        success: true,
        message: `${provider} disconnected.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IntegrationController();
