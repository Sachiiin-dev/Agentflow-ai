/**
 * Validation Agent
 * Verifies node output integrity, detects missing fields, and enforces schema contracts.
 */
class ValidationAgent {
  constructor() {
    this.name = 'validation';
  }

  /**
   * Validates step output
   */
  async validate(node, outputResult) {
    const { id, data = {} } = node;
    const requiredFields = data.requiredFields || [];

    if (!outputResult || !outputResult.output) {
      return {
        isValid: false,
        errorType: 'MISSING_FIELDS',
        message: `Node ${id} produced null or empty output.`,
        missingFields: ['output'],
      };
    }

    const outputObj = outputResult.output;
    const missing = [];

    for (const field of requiredFields) {
      if (outputObj[field] === undefined || outputObj[field] === null || outputObj[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return {
        isValid: false,
        errorType: 'MISSING_FIELDS',
        message: `Validation failed for node ${id}. Missing required fields: ${missing.join(', ')}`,
        missingFields: missing,
      };
    }

    return {
      isValid: true,
      message: `Validation passed for node ${id} [${node.data?.label || node.type}]. All contracts fulfilled.`,
      verifiedFieldsCount: Object.keys(outputObj).length,
    };
  }
}

module.exports = new ValidationAgent();
