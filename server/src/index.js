const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const config = require('./config/env');
const { connectDB, getDBStatus } = require('./config/db');
const { initSocket } = require('./config/socket');
const { initExecutionQueue } = require('./queues/executionQueue');
const errorHandler = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server, config.clientUrl);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [config.clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'Agentflow_AI',
    environment: config.nodeEnv,
    database: getDBStatus(),
    orchestrator: {
      langGraph: 'available',
      agents: ['planner', 'execution', 'validation', 'recovery', 'monitoring'],
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

// Bootstrap Server
const startServer = async () => {
  try {
    // 1. Connect to Database (with zero-dependency In-Memory fallback)
    await connectDB();

    // 2. Initialize Queue (BullMQ + Redis with in-memory worker fallback)
    initExecutionQueue();

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: Port ${config.port} is already in use by another process.`);
        console.error(`👉 Stop any previous node instances or specify a different PORT in server/.env\n`);
      } else {
        console.error('Server encountered an error:', err);
      }
      process.exit(1);
    });

    // 3. Start HTTP + Socket.IO server
    server.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Agentflow_AI Server running on http://localhost:${config.port}`);
      console.log(`🔗 API Health: http://localhost:${config.port}/api/health`);
      console.log(`🌐 Allowed Client: ${config.clientUrl}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
