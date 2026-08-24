const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const config = require('../config/env');
const mailService = require('./mailService');

class AuthService {
  generateToken(user) {
    const payload = {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'operator',
    };
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  async register({ name, email, password, role = 'operator' }) {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const err = new Error('User already exists with this email address.');
      err.statusCode = 409;
      throw err;
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: User.isMongooseActive ? password : await User.hashPassword(password),
      role: ['admin', 'operator', 'user'].includes(role) ? role : 'operator',
      lastLogin: new Date(),
    });

    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    };
  }

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await User.verifyPassword(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    // Update lastLogin
    await User.findByIdAndUpdate(user._id || user.id, { lastLogin: new Date() });

    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: new Date(),
      },
    };
  }

  async requestPasswordReset(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+resetToken +resetTokenExpires');

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

      await User.findByIdAndUpdate(user._id || user.id, {
        resetToken: resetTokenHash,
        resetTokenExpires,
      });

      await mailService.sendPasswordResetEmail(normalizedEmail, resetToken);
    }

    return {
      message: 'If an account exists for this email, password reset instructions will be sent shortly.',
    };
  }

  async resetPassword(token, password) {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetToken: resetTokenHash,
      resetTokenExpires: { $gt: new Date() },
    }).select('+resetToken +resetTokenExpires');

    if (!user) {
      const err = new Error('This password reset link is invalid or expired.');
      err.statusCode = 400;
      throw err;
    }

    const hashedPassword = await User.hashPassword(password);
    await User.findByIdAndUpdate(user._id || user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    });

    return { message: 'Password reset successfully. You can now sign in.' };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }

  async listAllUsers() {
    const users = await User.find({}).sort({ createdAt: -1 }).exec();
    return users.map((u) => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
    }));
  }

  async updateUserRole(targetUserId, newRole) {
    if (!['admin', 'operator', 'user'].includes(newRole)) {
      const err = new Error('Invalid role specified.');
      err.statusCode = 400;
      throw err;
    }

    const updated = await User.findByIdAndUpdate(
      targetUserId,
      { role: newRole },
      { new: true }
    );

    if (!updated) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return {
      id: updated._id || updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    };
  }

  async deleteUser(targetUserId) {
    const deleted = await User.findByIdAndDelete(targetUserId);
    if (!deleted) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, message: 'User removed from platform.' };
  }

  async getAdminDiagnostics() {
    const totalUsers = await User.countDocuments({});
    const adminCount = await User.countDocuments({ role: 'admin' });
    const operatorCount = await User.countDocuments({ role: 'operator' });
    const userCount = await User.countDocuments({ role: 'user' });

    return {
      userCounts: {
        total: totalUsers,
        admin: adminCount,
        operator: operatorCount,
        user: userCount,
      },
      system: {
        nodeVersion: process.version,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        env: config.nodeEnv,
      },
    };
  }
}

module.exports = new AuthService();
