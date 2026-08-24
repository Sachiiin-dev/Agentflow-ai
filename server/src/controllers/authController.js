const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const result = await authService.register({ name, email, password, role });
      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const result = await authService.requestPasswordReset(req.body.email);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async listUsers(req, res, next) {
    try {
      const users = await authService.listAllUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req, res, next) {
    try {
      const { role } = req.body;
      const updated = await authService.updateUserRole(req.params.id, role);
      res.status(200).json({
        success: true,
        message: 'User role updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const result = await authService.deleteUser(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getDiagnostics(req, res, next) {
    try {
      const diag = await authService.getAdminDiagnostics();
      res.status(200).json({
        success: true,
        data: diag,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
