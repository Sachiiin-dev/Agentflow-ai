const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;
let isInMemoryFallback = false;

const connectDB = async () => {
  if (isConnected) return;

  if (!config.mongoUri || config.mongoUri.includes('<db_password>')) {
    console.warn('[DB] MongoDB URI is not configured. Activating In-Memory Fallback Store.');
    isInMemoryFallback = true;
    isConnected = true;
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    // Connect with a short timeout so we quickly detect if local MongoDB is running
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    isInMemoryFallback = false;
    console.log(`[DB] Connected to MongoDB: ${config.mongoUri}`);
  } catch (err) {
    console.warn(`[DB] MongoDB connection failed (${err.message}). Activating In-Memory Fallback Store for zero-dependency local execution.`);
    isInMemoryFallback = true;
    isConnected = true;
  }
};

const getDBStatus = () => ({
  isConnected,
  isInMemoryFallback,
  uri: isInMemoryFallback ? 'in-memory-store' : config.mongoUri,
});

module.exports = {
  connectDB,
  getDBStatus,
  mongoose,
};
