/**
 * Recovery Agent
 * Classifies runtime and integration errors and formulates automatic recovery strategies.
 */
class RecoveryAgent {
  constructor() {
    this.name = 'recovery';
    this.maxRetries = 3;
  }

  /**
   * Classifies the error and decides recovery action
   */
  classifyAndPlan(error, retryCount = 0) {
    const errorStr = (error?.message || error?.error || String(error)).toUpperCase();

    let errorCategory = 'TRANSIENT';
    let decision = 'retry_with_backoff';
    let backoffDelayMs = 1000 * Math.pow(2, retryCount); // Exponential backoff: 1s, 2s, 4s

    if (errorStr.includes('AUTH_EXPIRED') || errorStr.includes('UNAUTHORIZED') || errorStr.includes('TOKEN') || errorStr.includes('INTEGRATION_NOT_CONNECTED')) {
      errorCategory = 'AUTH_EXPIRED';
      decision = 'escalate'; // Can't auto-retry without operator auth
    } else if (errorStr.includes('MISSING_FIELDS') || errorStr.includes('REQUIRED') || errorStr.includes('VALIDATION')) {
      errorCategory = 'MISSING_FIELDS';
      decision = retryCount < this.maxRetries ? 'retry_with_backoff' : 'escalate';
    } else if (errorStr.includes('RATE_LIMIT') || errorStr.includes('429') || errorStr.includes('TOO MANY REQUESTS')) {
      errorCategory = 'RATE_LIMIT';
      backoffDelayMs = Math.max(3000, 2000 * Math.pow(2, retryCount));
      decision = retryCount < this.maxRetries ? 'retry_with_backoff' : 'escalate';
    } else if (errorStr.includes('ECONNREFUSED') || errorStr.includes('ETIMEDOUT') || errorStr.includes('503') || errorStr.includes('502')) {
      errorCategory = 'API_FAILURE';
      decision = retryCount < this.maxRetries ? 'retry_with_backoff' : 'escalate';
    } else {
      errorCategory = 'TRANSIENT';
      decision = retryCount < this.maxRetries ? 'retry_with_backoff' : 'escalate';
    }

    return {
      errorCategory,
      decision, // 'retry_with_backoff' | 'escalate'
      retryCount,
      backoffDelayMs,
      message:
        decision === 'retry_with_backoff'
          ? `Recovery Agent scheduled retry #${retryCount + 1} with ${backoffDelayMs}ms exponential backoff (classified as ${errorCategory}).`
          : `Recovery Agent escalated incident to operator. Classification: ${errorCategory}. Retries exhausted or requires manual re-authorization.`,
    };
  }
}

module.exports = new RecoveryAgent();
