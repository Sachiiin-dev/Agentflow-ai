const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { createHybridModel } = require('./storeAdapter');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'operator', 'user'],
      default: 'operator',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    resetToken: {
      type: String,
      default: null,
      select: false,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password with bcrypt cost factor 12 before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const HybridUser = createHybridModel('User', userSchema);

// Helper for password hashing in both Mongoose and In-Memory modes
HybridUser.hashPassword = async (rawPassword) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(rawPassword, salt);
};

HybridUser.verifyPassword = async (candidate, hashed) => {
  return await bcrypt.compare(candidate, hashed);
};

module.exports = HybridUser;
