const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const config = require('../config/env');
const orchestrator = require('../agents/orchestrator');

let executionQueue = null;
let isRedisActive = false;

// Initialize BullMQ or in-memory fallback
const initExecutionQueue = () => {
  try {
    const redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 2) {
          console.warn('[Queue] Redis unavailable. Falling back to In-Memory Execution Queue.');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 500);
      },
    });

    redisClient.connect().then(() => {
      isRedisActive = true;
      executionQueue = new Queue('workflow-executions', {
        connection: redisClient,
      });

      new Worker(
        'workflow-executions',
        async (job) => {
          console.log(`[BullMQ Worker] Processing job ${job.id} for execution ${job.data.executionId}`);
          await orchestrator.runExecution(job.data.executionId);
        },
        { connection: redisClient }
      );

      console.log('[Queue] BullMQ initialized with Redis connection.');
    }).catch(() => {
      console.warn('[Queue] Using In-Memory Worker Queue fallback.');
      isRedisActive = false;
    });
  } catch (err) {
    console.warn(`[Queue] Redis init skipped (${err.message}). Using In-Memory Queue fallback.`);
    isRedisActive = false;
  }
};

/**
 * Enqueue execution run
 */
const queueExecution = async (executionId) => {
  if (isRedisActive && executionQueue) {
    try {
      await executionQueue.add('run-execution', { executionId }, {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false,
      });
      return { queued: true, provider: 'bullmq-redis' };
    } catch (err) {
      console.warn('[Queue] Failed to enqueue to BullMQ, executing via In-Memory Queue.');
    }
  }

  // In-Memory Asynchronous Queue Dispatch
  setImmediate(async () => {
    try {
      console.log(`[In-Memory Queue] Dispatching execution ${executionId}`);
      await orchestrator.runExecution(executionId);
    } catch (err) {
      console.error(`[In-Memory Queue] Error running execution ${executionId}:`, err);
    }
  });

  return { queued: true, provider: 'in-memory-queue' };
};

module.exports = {
  initExecutionQueue,
  queueExecution,
};
