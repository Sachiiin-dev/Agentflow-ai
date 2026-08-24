const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Request payload validation failed.',
      errors: errors.array().map((e) => ({ field: e.path || e.param, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
