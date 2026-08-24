const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  
  // Clean error message without exposing sensitive internals
  let errorMessage = err.message || 'An unexpected internal server error occurred.';
  let errorCode = err.code || 'INTERNAL_ERROR';

  if (err.name === 'ValidationError') {
    errorCode = 'MONGOOSE_VALIDATION_ERROR';
  } else if (err.code === 11000) {
    errorCode = 'DUPLICATE_KEY_ERROR';
    errorMessage = 'A record with this identifier already exists.';
  }

  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
